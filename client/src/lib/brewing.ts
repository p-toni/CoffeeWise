import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export const useStartBrewing = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/brewing/start", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start brewing");
      return res.json();
    },
  });
};

export const useUpdateSettings = (brewingId: string) => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/brewing/${brewingId}/settings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
  });
};

export const useUpdateSteps = (brewingId: string) => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/brewing/${brewingId}/steps`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update steps");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both the steps and settings queries since they're related
      queryClient.invalidateQueries({ queryKey: [`/api/brewing/${brewingId}/steps`] });
      queryClient.invalidateQueries({ queryKey: [`/api/brewing/${brewingId}/settings`] });
    },
  });
};

export const useUpdateTasting = (brewingId: string) => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/brewing/${brewingId}/tasting`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update tasting");
      return res.json();
    },
  });
};
