/**
 * Task Filtering Utilities
 * 
 * Pure functions for filtering tasks - no dependencies on state management
 * These functions are easily testable and reusable
 */

/**
 * Filter tasks based on status
 * @param {Array} tasks - Array of task objects
 * @param {Array} filterStatuses - Array of status IDs to include (e.g., ["todo", "inProgress"])
 * @returns {Array} Filtered tasks
 */
export const filterByStatus = (tasks, filterStatuses) => {
  if (!tasks || tasks.length === 0) return [];
  if (!filterStatuses || filterStatuses.includes("all")) return tasks;
  
  return tasks.filter((task) => filterStatuses.includes(task.status));
};

/**
 * Filter tasks based on search query
 * @param {Array} tasks - Array of task objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered tasks
 */
export const filterBySearch = (tasks, searchQuery) => {
  if (!tasks || tasks.length === 0) return [];
  if (!searchQuery || !searchQuery.trim()) return tasks;
  
  const query = searchQuery.toLowerCase().trim();
  return tasks.filter((task) =>
    task.title?.toLowerCase().includes(query) ||
    task.description?.toLowerCase().includes(query)
  );
};

/**
 * Apply all filters to tasks
 * @param {Array} tasks - Array of task objects
 * @param {Object} filterOptions - Filter configuration
 * @param {Array} filterOptions.filterStatuses - Status filters
 * @param {string} filterOptions.searchQuery - Search query
 * @param {boolean} filterOptions.activeSearch - Whether search is active
 * @returns {Array} Filtered tasks
 */
export const filterTasks = (tasks, { filterStatuses, searchQuery, activeSearch }) => {
  if (!tasks || tasks.length === 0) return [];
  
  let filtered = tasks;
  
  // Apply status filter
  filtered = filterByStatus(filtered, filterStatuses);
  
  // Apply search filter if active
  if (activeSearch) {
    filtered = filterBySearch(filtered, searchQuery);
  }
  
  return filtered;
};

/**
 * Handle status filter change logic
 * Toggles a status in the filter list or sets it as the only filter
 * @param {Array} currentStatuses - Current filter statuses
 * @param {string} statusToToggle - Status to toggle
 * @returns {Array} New filter statuses array
 */
export const handleStatusFilterChange = (currentStatuses, statusToToggle) => {
  // If clicking "all", reset to just "all"
  if (statusToToggle === "all") {
    return ["all"];
  }
  
  // If "all" is currently selected, replace with just the new status
  if (currentStatuses.includes("all")) {
    return [statusToToggle];
  }
  
  // If status is already selected, remove it
  if (currentStatuses.includes(statusToToggle)) {
    const newStatuses = currentStatuses.filter((s) => s !== statusToToggle);
    // If no statuses left, default to "all"
    return newStatuses.length === 0 ? ["all"] : newStatuses;
  }
  
  // Otherwise, add the status
  return [...currentStatuses, statusToToggle];
};
