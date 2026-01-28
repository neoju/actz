import { createMutation, useQueryClient } from "@tanstack/svelte-query";

interface MonthlyPlanResponse {
    monthly_summary: string;
    weeks: Array<{
        week_number: number;
        focus: string;
        pt_summary: string;
        daily_plan: Array<{
            day: string;
            title: string;
            exercises: Array<{
                name: string;
                sets: string;
                reps: string;
                notes: string;
            }>;
            estimated_time: string;
        }>;
    }>;
    planId: string;
}

export const monthlyPlanKeys = {
    all: ["monthlyPlan"] as const,
    active: () => [...monthlyPlanKeys.all, "active"] as const,
    // We might want to invalidate weekly plans too since they are linked
};

async function generateMonthlyPlan(): Promise<MonthlyPlanResponse> {
    const response = await fetch("/api/monthly-plan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate monthly plan");
    }

    return response.json();
}

export function useGenerateMonthlyPlanMutation() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: generateMonthlyPlan,
        onSuccess: (data) => {
            // Invalidate both monthly and weekly plan queries since this affects active plans
            queryClient.invalidateQueries({ queryKey: ["weeklyPlan"] });
            queryClient.invalidateQueries({ queryKey: monthlyPlanKeys.all });
        },
    }));
}
