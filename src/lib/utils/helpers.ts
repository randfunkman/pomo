// src/lib/utils/helpers.ts

/**
 * Formats a time given in seconds into a MM:SS string.
 * @param totalSeconds - The total time in seconds.
 * @returns A string representing the time in MM:SS format.
 */
export function formatTime(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const paddedMinutes = String(minutes).padStart(2, '0');
	const paddedSeconds = String(seconds).padStart(2, '0');
	return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Generates a simple unique ID string.
 * For more robust applications, consider UUIDs.
 * @param prefix - An optional prefix for the ID.
 * @returns A unique string ID.
 */
export function generateId(prefix: string = 'id_'): string {
	return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2);
}
