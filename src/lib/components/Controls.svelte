<script lang="ts">
	import type { TimerMode } from '../types';

	// Props for the component, including current state and callback functions for actions
	let {
		isPaused,
		currentMode,
		breakBankAmount,
		onPauseResume,
		onUseBreakBank,
		onSkipBreak,
		onToggleState,
		onResetTimer
	}: {
		isPaused: boolean;
		currentMode: TimerMode;
		breakBankAmount: number;
		onPauseResume: () => void;
		onUseBreakBank: () => void;
		onSkipBreak: () => void;
		onToggleState: () => void;
		onResetTimer: () => void;
	} = $props();

	// SVG icons
	const playIconPath = 'M5 3l14 9-14 9V3z';
	const pauseIconPath = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';
	const skipIconPath = 'M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z'; // Skip forward
	const bankIconPath = 'M3 6h3v12H3V6zm5 0h3v12H8V6zm5 0h3v12h-3V6zm5 0h3v12h-3V6z'; // Bank / Piggy bank style
	const switchIconPath = 'M16.01 11H4v2h12.01v3L20 12l-3.99-4v3zM9 3L5 7l3.99 4V8h12.01V6H9V3z'; // Arrows switching
	const resetIconPath =
		'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z';

	const baseButtonClass =
		'w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-150';
	const primaryButtonClass = 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
	const secondaryButtonClass =
		'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-800 dark:hover:bg-indigo-700';
	const disabledButtonClass =
		'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400';
</script>

<div class="space-y-3 rounded-lg bg-slate-100 p-4 shadow dark:bg-slate-800">
	<button
		onclick={onPauseResume}
		class="{baseButtonClass} {isPaused
			? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'
			: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400'}"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="currentColor"
			viewBox="0 0 20 20"
		>
			{#if isPaused}
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
					clip-rule="evenodd"
				/>
			{:else}
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
					clip-rule="evenodd"
				/>
			{/if}
		</svg>
		{isPaused ? 'Resume' : 'Pause'}
	</button>

	<button
		onclick={onUseBreakBank}
		disabled={currentMode !== 'Work' || breakBankAmount <= 0}
		class="{baseButtonClass} {currentMode === 'Work' && breakBankAmount > 0
			? secondaryButtonClass
			: disabledButtonClass}"
		aria-disabled={currentMode !== 'Work' || breakBankAmount <= 0}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d={bankIconPath} /></svg
		>
		Use Break Bank ({breakBankAmount} min)
	</button>

	<button
		onclick={onSkipBreak}
		disabled={currentMode !== 'Break'}
		class="{baseButtonClass} {currentMode === 'Break' ? secondaryButtonClass : disabledButtonClass}"
		aria-disabled={currentMode !== 'Break'}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d={skipIconPath} /></svg
		>
		Skip Break & Bank Remaining
	</button>

	<button onclick={onToggleState} class="{baseButtonClass} {secondaryButtonClass}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			><path stroke-linecap="round" stroke-linejoin="round" d={switchIconPath} /></svg
		>
		Switch to {currentMode === 'Work' ? 'Break' : 'Work'}
	</button>

	<button onclick={onResetTimer} class="{baseButtonClass} {secondaryButtonClass}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			><path stroke-linecap="round" stroke-linejoin="round" d={resetIconPath} /></svg
		>
		Reset Timer
	</button>
</div>
