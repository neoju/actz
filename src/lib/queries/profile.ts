import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";
import type { ProfileFormData } from "$lib/schemas/profile";

export interface ProfileResponse {
  user: {
    id: string;
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    bmi?: string;
    fitnessLevel?: string;
    equipment?: string;
    schedule?: string;
    limitations?: string;
    target?: string;
  };
}

/**
 * Query key factory for profile-related queries
 */
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

/**
 * Fetch user profile
 */
async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch("/api/user/profile");
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

/**
 * Update user profile
 */
async function updateProfile(data: ProfileFormData): Promise<ProfileResponse> {
  const response = await fetch("/api/user/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

async function applySampleProfile(): Promise<ProfileResponse> {
  const response = await fetch("/api/user/profile/sample", { method: "POST" });

  if (!response.ok) {
    throw new Error("Failed to apply sample profile");
  }

  return response.json();
}

/**
 * Hook to fetch user profile with caching
 */
export function useProfileQuery() {
  return createQuery<ProfileResponse>(() => ({
    queryKey: profileKeys.detail(),
    queryFn: fetchProfile,
  }));
}

/**
 * Hook to update user profile with automatic cache invalidation
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return createMutation<ProfileResponse, Error, ProfileFormData>(() => ({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(profileKeys.detail(), data);
    },
  }));
}

export function useApplySampleProfileMutation() {
  const queryClient = useQueryClient();

  return createMutation<ProfileResponse, Error, void>(() => ({
    mutationFn: applySampleProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
    },
  }));
}
