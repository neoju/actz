import { createMutation, useQueryClient } from "@tanstack/svelte-query";
import { invalidateAll } from "$app/navigation";

interface UpdateActivityRequest {
  plannedExerciseId: string;
  status: string;
  activityId?: string;
}

/**
 * Query key factory for activity-related queries
 */
export const activityKeys = {
  all: ["activity"] as const,
  byExercise: (exerciseId: string) =>
    [...activityKeys.all, "exercise", exerciseId] as const,
};

/**
 * Update exercise activity status
 */
async function updateActivity(data: UpdateActivityRequest): Promise<void> {
  const response = await fetch("/api/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update activity");
  }
}

/**
 * Hook to update activity with automatic cache invalidation
 */
export function useUpdateActivityMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: updateActivity,
    onSuccess: () => {
      // Invalidate all activity queries
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      // Also invalidate SvelteKit's cache
      invalidateAll();
    },
  }));
}
