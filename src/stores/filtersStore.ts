import { create } from "zustand";
import type { PriorityLevel } from "../../shared/types";

export type PriorityFilter = "all" | PriorityLevel;
export type DueDateFilter = "all" | "overdue" | "today" | "upcoming";
export type StatusFilter = "all" | "active" | "completed";

interface FiltersState {
  searchQuery: string;
  filterPriority: PriorityFilter;
  filterDueDate: DueDateFilter;
  filterGroup: string;
  filterStatus: StatusFilter;

  setSearchQuery: (query: string) => void;
  setFilterPriority: (p: PriorityFilter) => void;
  setFilterDueDate: (d: DueDateFilter) => void;
  setFilterGroup: (g: string) => void;
  setFilterStatus: (s: StatusFilter) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  searchQuery: "",
  filterPriority: "all",
  filterDueDate: "all",
  filterGroup: "all",
  filterStatus: "all",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterDueDate: (d) => set({ filterDueDate: d }),
  setFilterGroup: (g) => set({ filterGroup: g }),
  setFilterStatus: (s) => set({ filterStatus: s }),

  resetFilters: () =>
    set({
      searchQuery: "",
      filterPriority: "all",
      filterDueDate: "all",
      filterGroup: "all",
      filterStatus: "all",
    }),
}));
