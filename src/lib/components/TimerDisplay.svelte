<script lang="ts">
	import type { TimerMode } from '../types';
	import { formatTime } from '../utils/helpers';

	// Props for the component
	let {
		timeInSeconds,
		currentMode
	}: {
		timeInSeconds: number;
		currentMode: TimerMode;
	} = $props();

	// Derived state for the formatted time string
	const displayTime = $derived(formatTime(timeInSeconds));

	// SVG path for a simple play icon (used for resume)
	const playIconPath = 'M5 3l14 9-14 9V3z';
	// SVG path for a simple pause icon
	const pauseIconPath = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';
</script>

<div
	class="my-6 rounded-xl p-6 text-center shadow-xl"
	class:bg-sky-600={currentMode === 'Work'}
	class:text-sky-50={currentMode === 'Work'}
	class:bg-emerald-600={currentMode === 'Break'}
	class:text-emerald-50={currentMode === 'Break'}
>
	<p class="text-sm font-medium tracking-wider uppercase">
		{currentMode} Mode
	</p>
	<p class="my-2 text-7xl font-bold tracking-tight">
		{displayTime}
	</p>
	{#if timeInSeconds <= 0}
		<p class="text-sm opacity-80">Time's up!</p>
	{/if}
</div>
