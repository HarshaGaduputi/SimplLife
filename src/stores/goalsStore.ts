import { create } from "zustand";
import { goalsService } from "@/services/api";
import type { Goal } from "../../shared/types";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  loadGoals: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  loading: false,
  loadGoals: async () => {
    set({ loading: true });
    try {
      const res = await goalsService.list();
      set({ goals: res.goals });
    } finally {
      set({ loading: false });
    }
  }
}));
