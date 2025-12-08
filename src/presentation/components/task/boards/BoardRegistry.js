"use client";
import { KanbanBoard } from "./KanbanBoard";

/**
 * BoardRegistry - Manages different board types
 * 
 * This allows easy swapping of board implementations
 * and adding new board types without modifying the page component
 */

const BOARD_TYPES = {
  kanban: KanbanBoard,
  // Future board types can be added here:
  // list: ListBoard,
  // timeline: TimelineBoard,
  // calendar: CalendarBoard,
};

/**
 * Get a board component by type
 * @param {string} boardType - Type of board ('kanban', 'list', etc.)
 * @returns {React.Component} Board component
 */
export const getBoardComponent = (boardType = "kanban") => {
  const Board = BOARD_TYPES[boardType];
  if (!Board) {
    console.warn(`Board type "${boardType}" not found, defaulting to kanban`);
    return BOARD_TYPES.kanban;
  }
  return Board;
};

/**
 * Get all available board types
 * @returns {Array<string>} Array of board type names
 */
export const getAvailableBoardTypes = () => {
  return Object.keys(BOARD_TYPES);
};

export default BOARD_TYPES;
