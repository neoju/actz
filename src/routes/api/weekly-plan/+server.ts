import { json } from "@sveltejs/kit";
import { GoogleGenAI } from "@google/genai";
import { env } from "$env/dynamic/private";
import exercises from "../exercises.json";
import prisma from "$lib/prisma";

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

    // Extract unique categories and tags for context
    // @ts-ignore
    const categories = [...new Set(exercises.map((e) => e.category))];
    // @ts-ignore
    const allTags = exercises.flatMap((e) => e.tags);
    const tags = [...new Set(allTags)];
    const exerciseNames = exercises.map((e) => e.name).join(", ");

    const prompt = `
        You are an elite Personal Trainer (PT) and Nutritionist.
        Your goal is to create a highly personalized, safe, and effective ONE-WEEK workout plan for a client.

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

        Context:
        - The client has access to the following exercise categories: ${JSON.stringify(categories)}.
        - Relevant tags: ${JSON.stringify(tags)}.
        - Available Exercises in Database (prefer these names if suitable): ${exerciseNames}

        Instructions:
        1.  **Analyze the Client:** tailored to their BMI, fitness level, and limitations.
        2.  **Create a 7-Day Plan:** Design a complete week of workouts (including rest days) that fits their stated schedule.
        3.  **Detailed Daily Routine:** For each workout day, provide a title (e.g., "Upper Body Strength"), a list of exercises (name, sets, reps, notes), and an estimated completion time.
        4.  **Safety First:** If the client has limitations (e.g., knee pain), strictly avoid or modify exercises that aggravate it.
        5.  **Summary:** Provide a professional "PT Summary" assessing their current state and explaining *why* this plan will help them reach their goal.
        6.  **Plan Description:** A brief overview of the week's focus (e.g., "Hypertrophy focus with 3 rest days").

        Output Schema:
        Return PURE JSON matching the following structure:
        {
            "pt_summary": "Professional assessment and motivation.",
            "plan_description": "Brief overview of the week's strategy.",
            "weekly_plan": [
                {
                    "day": "Day 1",
                    "title": "Workout Title or 'Rest Day'",
                    "exercises": [
                        { "name": "Exercise Name", "sets": "3", "reps": "10-12", "notes": "Optional tip" }
                    ],
                    "estimated_time": "45 mins"
                }
                // ... for all 7 days
            ],
            "alert_msg": "Optional warning if the user's data is unsafe (e.g., extremely low BMI for weight loss)."
        }
        `;

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return json({ error: "Server configuration error" }, { status: 500 });
    }

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: "gemini-3-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            pt_summary: { type: "STRING" },
            plan_description: { type: "STRING" },
            weekly_plan: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  day: { type: "STRING" },
                  title: { type: "STRING" },
                  exercises: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        sets: { type: "STRING" },
                        reps: { type: "STRING" },
                        notes: { type: "STRING" },
                      },
                    },
                  },
                  estimated_time: { type: "STRING" },
                },
              },
            },
            alert_msg: { type: "STRING" },
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(resultText);

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
          create: result.weekly_plan.map((day: any, index: number) => ({
            dayName: day.day,
            title: day.title,
            estimatedTime: day.estimated_time,
            order: index + 1,
            exercises: {
              create: day.exercises.map((ex: any, exIndex: number) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                notes: ex.notes,
                order: exIndex + 1,
              })),
            },
          })),
        },
      },
    });

    return json({ ...result, planId: createdPlan.id });
  } catch (e) {
    console.error("Gemini API Error:", e);
    return json({ error: "Failed to generate weekly plan" }, { status: 500 });
  }
}
