import { createMutation, useQueryClient } from "@tanstack/svelte-query";

interface WeeklyPlanResponse {
  pt_summary: string;
  plan_description: string;
  weekly_plan: Array<{
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
  alert_msg?: string;
  planId: string;
}

/**
 * Query key factory for weekly plan-related queries
 */
export const weeklyPlanKeys = {
  all: ["weeklyPlan"] as const,
  active: () => [...weeklyPlanKeys.all, "active"] as const,
};

/**
 * Generate weekly plan (uses profile from database)
 */
async function generateWeeklyPlan(): Promise<WeeklyPlanResponse> {
  const response = await fetch("/api/weekly-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate weekly plan");
  }

  return response.json();
}

/**
 * Hook to generate weekly plan with automatic cache updates
 */
export function useGenerateWeeklyPlanMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: generateWeeklyPlan,
    onSuccess: () => {
      // Invalidate weekly plan queries to refetch
      queryClient.invalidateQueries({ queryKey: weeklyPlanKeys.all });
    },
  }));
}
