import { create } from "zustand";

export const useTaskUIStore = create((set, get) => ({
  // UI State
  activeSearch: false,
  isFilterOpen: false,
  isCreateTaskOpen: false,

  // Data
  searchQuery: "",
  filteredData: [],
  filterStatuses: ["all"],

  // Actions
  setActiveSearch: (active) => set({ activeSearch: active }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatuses: (statuses) => set({ filterStatuses: statuses }),
  setIsFilterOpen: (open) => set({ isFilterOpen: open }),
  setIsCreateTaskOpen: (open) => set({ isCreateTaskOpen: open }),
  setFilteredData: (data) => set({ filteredData: data }),

  // Complex Actions
  handleStatusFilterChange: (status) => {
    const { filterStatuses } = get();

    if (status === "all") {
      set({ filterStatuses: ["all"] });
      return;
    }

    const newStatuses = filterStatuses.includes("all")
      ? [status]
      : filterStatuses.includes(status)
      ? filterStatuses.filter((s) => s !== status)
      : [...filterStatuses, status];

    if (newStatuses.length === 0) {
      set({ filterStatuses: ["all"] });
    } else {
      set({ filterStatuses: newStatuses });
    }
  },

  getFilteredData: (data) => {
    const { filteredData, activeSearch, searchQuery, filterStatuses } = get();

    let filtered = data;

    if (!filterStatuses.includes("all")) {
      filtered = filtered.filter((task) =>
        filterStatuses.includes(task.status)
      );
    }

    if (activeSearch && searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({ filteredData: filtered });
  },

  resetFilters: () => {
    set({
      filterStatuses: ["all"],
      searchQuery: "",
      filteredData: [],
      activeSearch: false,
    });
  },
}));
