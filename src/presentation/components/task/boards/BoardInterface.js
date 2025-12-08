/**
 * Board Interface - Defines the contract for board components
 * 
 * All board implementations should:
 * - Accept a `data` prop (array of tasks)
 * - Accept an `onTaskUpdate` callback for task updates (e.g., drag & drop)
 * - Be fully self-contained and reusable
 */

/**
 * @typedef {Object} BoardProps
 * @property {Array} data - Array of task objects to display
 * @property {Function} onTaskUpdate - Callback when a task is updated (e.g., status change)
 * @property {Object} [config] - Optional configuration object for board-specific settings
 */

/**
 * Base board component interface
 * @param {BoardProps} props
 */
export const BoardInterface = ({ data, onTaskUpdate, config }) => {
  throw new Error("BoardInterface is an abstract class. Use a concrete implementation.");
};
