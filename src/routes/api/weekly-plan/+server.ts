import { json } from "@sveltejs/kit";
import { GoogleGenAI } from "@google/genai";
import { env } from "$env/dynamic/private";
import exercises from "../exercises.json";

export async function POST({ request }) {
  try {
    const data = await request.json();
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
    } = data;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Extract unique categories and tags for context to help the AI
    // @ts-ignore
    const categories = [...new Set(exercises.map((e) => e.category))];
    // @ts-ignore
    const allTags = exercises.flatMap((e) => e.tags);
    const tags = [...new Set(allTags)];

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
        - The client has access to the following exercises: ${JSON.stringify(exercises)}.

        Instructions:
        1.  **Analyze the Client:** tailored to their BMI, fitness level, and limitations.
        2.  **Create a 7-Day Plan:** Design a complete week of workouts (including rest days) that fits their stated schedule.
        3.  **Detailed Daily Routine:** For each workout day, provide a SHORT title (e.g., "Upper Body Strength"), a list of exercises (name, sets, reps, notes), and an estimated completion time.
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
      model: "gemini-2.5-flash",
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
    console.log(resultText);
    if (!resultText) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(resultText);
    return json(result);
  } catch (e) {
    console.error("Gemini API Error:", e);
    return json({ error: "Failed to generate weekly plan" }, { status: 500 });
  }
}
