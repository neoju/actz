
import { json } from "@sveltejs/kit";
import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "$env/dynamic/private";
import exercisesDB from "$lib/exercises.json";
import prisma from "$lib/prisma";
import { getOptimizedContext } from "$lib/utils/context-optimizer";

const PlanSchema = z.object({
  pt_summary: z.string(),
  plan_description: z.string(),
  weekly_plan: z.array(
    z.object({
      day: z.string(),
      title: z.string(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.string(),
          reps: z.string(),
          notes: z.string().optional().or(z.literal("")),
        }),
      ),
      estimated_time: z.string(),
    }),
  ),
  alert_msg: z.string().optional(),
});

export async function POST({ request, locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        age: true,
        gender: true,
        weight: true,
        height: true,
        fitnessLevel: true,
        equipment: true,
        schedule: true,
        limitations: true,
        target: true,
      },
    });

    if (!user || !user.age || !user.weight || !user.height) {
      return json(
        { error: "Please update your profile first" },
        { status: 400 },
      );
    }

    const {
      age,
      gender,
      weight,
      height,
      fitnessLevel,
      equipment,
      schedule,
      limitations,
      target,
    } = user;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Optimize context based on equipment
    const { categories, tags, exerciseNames, count } = getOptimizedContext(equipment, exercisesDB);
    console.log(`Context optimized: ${exercisesDB.length} -> ${count} exercises`);

    const systemPrompt = `
        You are an elite Personal Trainer (PT) and Nutritionist.
        Your goal is to create a highly personalized, safe, and effective ONE-WEEK workout plan for a client.

        Instructions:
        1.  **Analyze the Client:** tailored to their BMI, fitness level, and limitations.
        2.  **Create a 7-Day Plan:** Design a complete week of workouts (including rest days) that fits their stated schedule.
        3.  **Detailed Daily Routine:** For each workout day, provide a title (e.g., "Upper Body Strength"), a list of exercises (name, sets, reps, notes), and an estimated completion time.
        4.  **Safety First:** If the client has limitations (e.g., knee pain), strictly avoid or modify exercises that aggravate it.
        5.  **Summary:** Write a warm, encouraging, and professional personal note to the client. Address them directly (you can use "you"). Briefly assess their current state based on their profile and explain *specifically* why this plan is designed for them. motivating them to get started. Do not just list facts.
        6.  **Plan Description:** A brief overview of the week's focus (e.g., "Hypertrophy focus with 3 rest days").

        Context:
        - The client has access to the following exercise categories: ${JSON.stringify(categories)}.
        - Relevant tags: ${JSON.stringify(tags)}.
        - Available Exercises in Database (prefer these names if suitable): ${exerciseNames}

        Response Format:
        You must return a valid JSON object. Do not include any markdown formatting, code blocks, or explanations outside the JSON.
        The JSON object must strictly adhere to the following schema:

        {
          "pt_summary": "string",
          "plan_description": "string",
          "weekly_plan": [
            {
              "day": "Day 1",
              "title": "string",
              "exercises": [
                {
                  "name": "string",
                  "sets": "string",
                  "reps": "string",
                  "notes": "string"
                }
              ],
              "estimated_time": "string"
            }
          ],
          "alert_msg": "string (optional)"
        }

        Ensure the "weekly_plan" array contains exactly 7 items (Day 1 to Day 7).
        `;

    const userPrompt = `
        Client Profile:
        - Age: ${age}
        - Gender: ${gender}
        - Weight: ${weight}kg
        - Height: ${height}cm
        - BMI: ${bmi}
        - Fitness Level: ${fitnessLevel}
        - Equipment Available: ${equipment}
        - Schedule: ${schedule}
        - Limitations/Injuries: ${limitations}
        - Primary Goal: ${target}
        `;

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return json({ error: "Server configuration error" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error("No response from Groq");
    }

    const rawResult = JSON.parse(resultText);

    // Validate with Zod
    const result = PlanSchema.parse(rawResult);

    // Save Weekly Plan to Database
    // Deactivate any previous active plans
    await prisma.weeklyPlan.updateMany({
      where: { userId: session.user.id, isActive: true },
      data: { isActive: false },
    });

    const createdPlan = await prisma.weeklyPlan.create({
      data: {
        userId: session.user.id,
        ptSummary: result.pt_summary,
        planDescription: result.plan_description,
        startDate: new Date(), // Starts today
        // Create Days and Exercises
        days: {
          create: result.weekly_plan.map((day, index) => ({
            dayName: day.day,
            title: day.title,
            estimatedTime: day.estimated_time,
            order: index + 1,
            exercises: {
              create: day.exercises.map((ex, exIndex) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                notes: ex.notes || "",
                order: exIndex + 1,
              })),
            },
          })),
        },
      },
    });

    return json({ ...result, planId: createdPlan.id });
  } catch (e) {
    console.error("Groq API Error:", e);
    return json({ error: "Failed to generate weekly plan" }, { status: 500 });
  }
}
