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
      console.log('useUpdateSteps mutation called with:', data);
      const res = await fetch(`/api/brewing/${brewingId}/steps`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Update steps failed:', error);
        throw new Error(error || "Failed to update steps");
      }

      const responseData = await res.json();
      console.log('Update steps response:', responseData);
      return responseData;
    },
    onSuccess: async (data) => {
      console.log('Update steps succeeded:', data);
      // Force a refetch of the data
      await queryClient.invalidateQueries({ queryKey: [`/api/brewing/${brewingId}/steps`] });
      return queryClient.refetchQueries({ queryKey: [`/api/brewing/${brewingId}/steps`] });
    },
    onError: (error) => {
      console.error('Update steps mutation error:', error);
    }
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
