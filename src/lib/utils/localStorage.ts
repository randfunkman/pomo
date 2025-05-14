// src/lib/utils/localStorage.ts
import type { AppState } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

/**
 * Saves the application state to local storage.
 * @param state - The current application state to save.
 */
export function saveStateToLocalStorage(state: AppState): void {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			const serializedState = JSON.stringify(state);
			localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
		} catch (error) {
			console.error('Error saving state to local storage:', error);
			// Optionally, notify the user or handle the error more gracefully
		}
	}
}

/**
 * Loads the application state from local storage.
 * @returns The loaded application state, or null if no state is found or an error occurs.
 */
export function loadStateFromLocalStorage(): AppState | null {
	if (typeof window !== 'undefined' && window.localStorage) {
		try {
			const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (serializedState === null) {
				return null; // No state found
			}
			return JSON.parse(serializedState) as AppState;
		} catch (error) {
			console.error('Error loading state from local storage:', error);
			// localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted state
			return null;
		}
	}
	return null; // Local storage not available
}
