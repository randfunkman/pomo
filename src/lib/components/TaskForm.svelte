<script lang="ts">
	import type { Group, NewTaskData } from '../types';

	// Props for the component, including the callback for creating a task
	// and the list of available groups.
	let {
		onCreateTask,
		groups
	}: {
		onCreateTask: (taskData: NewTaskData) => void;
		groups: Group[];
	} = $props();

	// Reactive state for the form inputs
	let description = $state('');
	let minutes = $state(5); // Default break bank minutes
	let selectedGroupId = $state(groups[0]?.id || ''); // Default to the first group

	// Effect to reset selectedGroupId if groups change and current selection is invalid
	$effect(() => {
		if (groups.length > 0 && !groups.find((g) => g.id === selectedGroupId)) {
			selectedGroupId = groups[0].id;
		}
	});

	/**
	 * Handles the form submission.
	 * Validates inputs and calls the onCreateTask callback.
	 */
	function handleSubmit(): void {
		if (description.trim() === '') {
			// Basic validation: ensure description is not empty
			// In a real app, provide user feedback (e.g., a message)
			console.warn('Task description cannot be empty.');
			return;
		}
		if (minutes <= 0) {
			console.warn('Task minutes must be positive.');
			return;
		}
		if (!selectedGroupId) {
			console.warn('Please select a group.');
			return;
		}

		onCreateTask({
			description: description.trim(),
			minutes: minutes,
			groupId: selectedGroupId
		});

		// Reset form fields after submission
		description = '';
		minutes = 5;
		// selectedGroupId remains, or reset to default: selectedGroupId = groups[0]?.id || '';
	}
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		handleSubmit();
	}}
	class="space-y-4 rounded-lg bg-slate-100 p-4 shadow dark:bg-slate-800"
>
	<div>
		<label
			for="task-description"
			class="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Description</label
		>
		<input
			type="text"
			id="task-description"
			bind:value={description}
			placeholder="What needs to be done?"
			class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
			required
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="task-minutes" class="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>Break Minutes</label
			>
			<input
				type="number"
				id="task-minutes"
				bind:value={minutes}
				min="1"
				class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
				required
			/>
		</div>

		<div>
			<label for="task-group" class="block text-sm font-medium text-slate-700 dark:text-slate-300"
				>Group</label
			>
			<select
				id="task-group"
				bind:value={selectedGroupId}
				class="mt-1 block w-full rounded-md border-slate-300 bg-white py-2 pr-10 pl-3 text-base text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
			>
				{#each groups as group (group.id)}
					<option value={group.id}>{group.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<button
		type="submit"
		class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
	>
		Add Task
	</button>
</form>
