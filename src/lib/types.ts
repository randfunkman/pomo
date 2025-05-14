// src/lib/types.ts

/**
 * Represents a single to-do task.
 */
export interface Task {
	id: string; // Unique identifier for the task
	description: string; // What needs to be done
	minutes: number; // Break bank time awarded upon completion
	groupId: string; // ID of the group this task belongs to
	completed: boolean; // Whether the task is marked as done
	order: number; // For sorting tasks within a group
	createdAt: number; // Timestamp of creation
}

/**
 * Represents a group of tasks.
 * Designed to be extensible for user-defined groups in the future.
 */
export interface Group {
	id: string; // Unique identifier for the group
	name: string; // Display name of the group
	// color?: string; // Optional: for future visual distinction
}

/**
 * Represents the current timer mode.
 */
export type TimerMode = 'Work' | 'Break';

/**
 * Represents the overall application state, primarily for visual theming or mode-specific logic.
 * Can be expanded if more complex app-wide states are needed beyond the timer mode.
 */
export interface AppState {
	tasks: Task[];
	groups: Group[]; // Though initially static, storing it allows for future dynamic changes
	breakBank: number; // Accumulated break minutes
	workDuration: number; // Default work session length in seconds
	breakDuration: number; // Default break session length in seconds
	nextTaskId: number; // Counter for generating unique task IDs (simple approach)
	// Could also include: currentTimerMode, currentTimeInSeconds, isPaused if saving full session state
}

/**
 * Represents the data structure for creating a new task.
 * Used by TaskForm.
 */
export interface NewTaskData {
	description: string;
	minutes: number;
	groupId: string;
}

/**
 * Represents the details for a drop event, specifically for task reordering.
 */
export interface TaskDropDetails {
	draggedTaskId: string;
	targetTaskId?: string; // ID of the task being dropped onto (for reordering)
	targetGroupId: string; // ID of the group being dropped into
	dropEffect: 'move' | 'copy'; // Usually 'move'
}
