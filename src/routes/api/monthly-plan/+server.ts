import { json } from "@sveltejs/kit";
import Groq from "groq-sdk";
import { env } from "$env/dynamic/private";
import { z } from "zod";
import exercisesDB from "$lib/exercises.json";
import prisma from "$lib/prisma";
import { getOptimizedContext } from "$lib/utils/context-optimizer";

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
        const { categories, tags, exerciseNames } = getOptimizedContext(equipment, exercisesDB);

        const systemPrompt = `
        You are an elite Personal Trainer (PT) and Nutritionist.
        Your goal is to create a COMPREHENSIVE 4-WEEK (Monthly) workout plan for a client.

        Instructions:
        1.  **Analyze**: Use the client's profile (BMI, fitness level, goals) to design a progressive plan.
        2.  **Periodization**: Structure the 4 weeks logically. For example:
            - Week 1: Foundation/Acclimatization
            - Week 2: Increasing Intensity/Volume
            - Week 3: Peak Performance/Overreaching
            - Week 4: Deload/Recovery
        3.  **Consistency**: Ensure the plan fits their schedule and limitations perfectly.
        4.  **Monthly Summary**: Write a motivating overview of the entire month's journey.

        Response Format:
        Return valid JSON only. NO Text blocks or markdown.
        Strictly adhere to this JSON structure:
        {
          "monthly_summary": "Overall goal and strategy for the month.",
          "weeks": [
            {
              "week_number": 1,
              "focus": "Week 1 Focus (e.g., Foundation)",
              "pt_summary": "Specific note for this week.",
              "daily_plan": [
                {
                  "day": "Day 1",
                  "title": "Workout Title",
                  "exercises": [
                    { "name": "Exercise", "sets": "3", "reps": "12", "notes": "..." }
                  ],
                  "estimated_time": "45 mins"
                }
                // ... 7 days
              ]
            }
            // ... 4 weeks
          ]
        }
        `;

        const userPrompt = `
        Client Profile:
        - Age: ${age}, Gender: ${gender}
        - Weight: ${weight}kg, Height: ${height}cm, BMI: ${bmi}
        - Fitness Level: ${fitnessLevel}
        - Equipment: ${equipment}
        - Schedule: ${schedule}
        - Limitations: ${limitations}
        - Goal: ${target}

        Context:
        - Categories: ${JSON.stringify(categories)}
        - Tags: ${JSON.stringify(tags)}
        - Exercises: ${exerciseNames}
        `;

        const apiKey = env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not set");
            return json({ error: "Server configuration error" }, { status: 500 });
        }

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const resultText = completion.choices[0]?.message?.content;
        if (!resultText) throw new Error("No response from Groq");

        const result = JSON.parse(resultText);

        // Save Monthly Plan
        const userId = session.user.id;

        // Deactivate previous
        await prisma.monthlyPlan.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false }
        });

        const monthlyPlan = await prisma.monthlyPlan.create({
            data: {
                userId,
                summary: result.monthly_summary,
                weeks: {
                    create: result.weeks.map((week: any) => ({
                        userId, // WeeklyPlan needs userId
                        planDescription: week.focus,
                        ptSummary: week.pt_summary,
                        isActive: true, // They are active parts of the current month
                        // Create days
                        days: {
                            create: week.daily_plan.map((day: any, dIndex: number) => ({
                                dayName: day.day,
                                title: day.title,
                                estimatedTime: day.estimated_time,
                                order: dIndex + 1,
                                exercises: {
                                    create: day.exercises.map((ex: any, exIndex: number) => ({
                                        name: ex.name,
                                        sets: ex.sets,
                                        reps: ex.reps,
                                        notes: ex.notes,
                                        order: exIndex + 1
                                    }))
                                }
                            }))
                        }
                    }))
                }
            }
        });

        return json({ ...result, planId: monthlyPlan.id });

    } catch (e) {
        console.error("Monthly Plan Error:", e);
        return json({ error: "Failed to generate monthly plan" }, { status: 500 });
    }
}
