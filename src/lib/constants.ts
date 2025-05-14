// src/lib/constants.ts
import type { Group } from './types';

/**
 * Initial static groups for tasks.
 * Designed to be easily replaced or augmented if groups become user-editable.
 */
export const INITIAL_GROUPS: Group[] = [
	{ id: 'group_must_do', name: 'Absolute Must Do' },
	{ id: 'group_likely_do', name: 'Likely Do' },
	{ id: 'group_stretch', name: 'Stretch Goals' }
];

/**
 * Default duration for a work session in seconds (25 minutes).
 * This can be made user-configurable later.
 */
export const DEFAULT_WORK_DURATION_SECONDS: number = 25 * 60;

/**
 * Default duration for a break session in seconds (5 minutes).
 * This can be made user-configurable later.
 */
export const DEFAULT_BREAK_DURATION_SECONDS: number = 5 * 60;

/**
 * Key used for storing the application state in local storage.
 */
export const LOCAL_STORAGE_KEY = 'pomoAppState';
