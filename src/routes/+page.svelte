<script lang="ts">
	import type { Task, Group, TimerMode, NewTaskData, AppState } from '$lib/types';
	import {
		INITIAL_GROUPS,
		DEFAULT_WORK_DURATION_SECONDS,
		DEFAULT_BREAK_DURATION_SECONDS
	} from '$lib/constants';
	import { saveStateToLocalStorage, loadStateFromLocalStorage } from '$lib/utils/localStorage';
	import { generateId } from '$lib/utils/helpers';

	import TaskForm from '$lib/components/TaskForm.svelte';
	import TaskGroup from '$lib/components/TaskGroup.svelte';
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import Controls from '$lib/components/Controls.svelte';

	// --- Core Application State ---
	let tasks = $state<Task[]>([]);
	let groups = $state<Group[]>([...INITIAL_GROUPS]); // Make a copy to ensure it's modifiable if needed later
	let currentTimerMode = $state<TimerMode>('Work');
	let workDuration = $state(DEFAULT_WORK_DURATION_SECONDS);
	let breakDuration = $state(DEFAULT_BREAK_DURATION_SECONDS);
	let currentTimeInSeconds = $state(DEFAULT_WORK_DURATION_SECONDS);
	let breakBank = $state(0);
	let isPaused = $state(true); // Start paused, will be unpaused by effect after load
	let nextTaskIdCounter = $state(1); // For simple ID generation, will be loaded/updated

	// --- Drag and Drop State ---
	let draggedTaskId = $state<string | null>(null);

	// --- Derived State ---
	const tasksByGroupId = $derived((groupId: string) => {
		return tasks.filter((t) => t.groupId === groupId).sort((a, b) => a.order - b.order);
	});

	// --- Effects ---

	// Effect for Timer Logic
	$effect(() => {
		if (isPaused) return;

		if (currentTimeInSeconds <= 0) {
			handleTimerEnd();
			return;
		}

		const timerInterval = setInterval(() => {
			if (!isPaused && currentTimeInSeconds > 0) {
				currentTimeInSeconds--;
			} else if (currentTimeInSeconds <= 0) {
				handleTimerEnd(); // Ensure it's called if timer hits zero while interval is active
			}
		}, 1000);

		return () => clearInterval(timerInterval);
	});

	// Effect for Local Storage Persistence
	// This effect runs whenever its dependencies (tasks, groups, etc.) change.
	$effect(() => {
		const appStateToSave: AppState = {
			tasks: tasks,
			groups: groups, // Save groups in case they become dynamic
			breakBank: breakBank,
			workDuration: workDuration,
			breakDuration: breakDuration,
			nextTaskId: nextTaskIdCounter
		};
		saveStateToLocalStorage(appStateToSave);
	});

	// Effect for Initial Load from Local Storage (runs once on component mount)
	$effect(() => {
		const loadedState = loadStateFromLocalStorage();
		if (loadedState) {
			tasks = loadedState.tasks;
			// If groups become user-editable, load them here too. For now, they are static on init.
			// groups = loadedState.groups;
			breakBank = loadedState.breakBank;
			workDuration = loadedState.workDuration;
			breakDuration = loadedState.breakDuration;
			nextTaskIdCounter = loadedState.nextTaskId;

			// Restore timer state (simplified: start new work session or based on saved mode)
			// For a true "resume session", more state would need to be saved/loaded.
			currentTimerMode = 'Work'; // Default to Work on load
			currentTimeInSeconds = workDuration;
		} else {
			// Initialize with defaults if no saved state
			currentTimeInSeconds = workDuration; // Start with work duration
			tasks = []; // Start with no tasks
			breakBank = 0;
			nextTaskIdCounter = 1;
		}
		isPaused = false; // Start the timer immediately after loading/initializing

		// Cleanup function for $effect (optional, not strictly needed here)
		return () => {
			// console.log("Initial load effect cleanup");
		};
	});

	// --- Task Management Functions ---
	function addTask(newTaskData: NewTaskData): void {
		const newOrder = tasks.filter((t) => t.groupId === newTaskData.groupId).length;
		const newTask: Task = {
			id: generateId('task_'),
			description: newTaskData.description,
			minutes: newTaskData.minutes,
			groupId: newTaskData.groupId,
			completed: false,
			order: newOrder,
			createdAt: Date.now()
		};
		tasks = [...tasks, newTask];
		nextTaskIdCounter++;
	}

	function deleteTask(taskId: string): void {
		const taskToDelete = tasks.find((t) => t.id === taskId);
		if (taskToDelete && taskToDelete.completed) {
			// Optional: Reclaim break bank minutes if a completed task is deleted?
			// For now, let's assume banked time stays banked.
		}
		tasks = tasks.filter((t) => t.id !== taskId);
		// Re-order tasks in the affected group
		if (taskToDelete) {
			renumberTasksInGroup(taskToDelete.groupId);
		}
	}

	function toggleTaskComplete(taskId: string): void {
		tasks = tasks.map((task) => {
			if (task.id === taskId) {
				const updatedTask = { ...task, completed: !task.completed };
				if (updatedTask.completed && !task.completed) {
					// Task just completed
					breakBank += updatedTask.minutes;
				} else if (!updatedTask.completed && task.completed) {
					// Task un-completed
					breakBank = Math.max(0, breakBank - updatedTask.minutes); // Prevent negative bank
				}
				return updatedTask;
			}
			return task;
		});
	}

	function renumberTasksInGroup(groupId: string): void {
		let orderCounter = 0;
		tasks = tasks
			.map((t) => {
				if (t.groupId === groupId) {
					return { ...t, order: orderCounter++ };
				}
				return t;
			})
			.sort((a, b) => {
				// Global sort might be needed if group changes affect overall array structure for reactivity
				if (a.groupId === b.groupId) return a.order - b.order;
				return (
					groups.findIndex((g) => g.id === a.groupId) - groups.findIndex((g) => g.id === b.groupId)
				);
			});
	}

	// --- Drag and Drop Handlers ---
	function handleDragStartTask(event: DragEvent, taskId: string): void {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', taskId);
			event.dataTransfer.effectAllowed = 'move';
			draggedTaskId = taskId;
		}
	}

	function handleDragOverGroupOrItem(event: DragEvent): void {
		event.preventDefault(); // Necessary to allow dropping
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDropOnGroup(event: DragEvent, targetGroupId: string): void {
		event.preventDefault();
		const taskIdToMove = event.dataTransfer?.getData('text/plain');
		if (!taskIdToMove || taskIdToMove === draggedTaskId) {
			// Ensure it's the one we started dragging
			const taskIndex = tasks.findIndex((t) => t.id === taskIdToMove);
			if (taskIndex > -1) {
				const originalGroupId = tasks[taskIndex].groupId;
				tasks[taskIndex].groupId = targetGroupId;
				// Append to the end of the new group
				tasks[taskIndex].order = tasks.filter((t) => t.groupId === targetGroupId).length - 1; // 0-indexed
				tasks = [...tasks]; // Trigger reactivity

				renumberTasksInGroup(originalGroupId);
				renumberTasksInGroup(targetGroupId);
			}
		}
		draggedTaskId = null;
	}

	function handleDropOnTaskItem(event: DragEvent, targetTaskId: string): void {
		event.preventDefault();
		event.stopPropagation(); // Prevent bubbling to group's drop handler

		const taskIdToMove = event.dataTransfer?.getData('text/plain');
		if (!taskIdToMove || taskIdToMove === draggedTaskId) {
			const draggedTaskIndex = tasks.findIndex((t) => t.id === taskIdToMove);
			const targetTaskIndex = tasks.findIndex((t) => t.id === targetTaskId);

			if (draggedTaskIndex > -1 && targetTaskIndex > -1 && taskIdToMove !== targetTaskId) {
				const dragged = tasks[draggedTaskIndex];
				const target = tasks[targetTaskIndex];
				const originalGroupId = dragged.groupId;
				const targetGroupId = target.groupId;

				// Update group if different
				dragged.groupId = targetGroupId;

				// Reordering logic: insert dragged task before target task
				const tasksInTargetGroup = tasks
					.filter((t) => t.groupId === targetGroupId && t.id !== taskIdToMove)
					.sort((a, b) => a.order - b.order);

				const insertionPoint = tasksInTargetGroup.findIndex((t) => t.id === targetTaskId);

				dragged.order = target.order; // Temporarily assign target's order

				// Shift orders of subsequent tasks
				tasks = tasks.map((t) => {
					if (t.groupId === targetGroupId && t.id !== taskIdToMove && t.order >= target.order) {
						return { ...t, order: t.order + 1 };
					}
					return t;
				});
				// Place the dragged task
				tasks = tasks.map((t) => (t.id === taskIdToMove ? { ...dragged, order: target.order } : t));

				// Ensure all tasks are correctly ordered within their groups
				renumberTasksInGroup(originalGroupId);
				if (originalGroupId !== targetGroupId) {
					renumberTasksInGroup(targetGroupId);
				} else {
					renumberTasksInGroup(targetGroupId); // Renumber the common group
				}
			}
		}
		draggedTaskId = null;
	}

	function handleDragEnd(): void {
		draggedTaskId = null;
		// Could remove 'dragging' class from all elements if it wasn't handled by item itself
	}

	// --- Timer Control Functions ---
	function handlePauseResume(): void {
		isPaused = !isPaused;
	}

	function switchToMode(newMode: TimerMode, newTime?: number): void {
		currentTimerMode = newMode;
		if (newTime !== undefined) {
			currentTimeInSeconds = newTime;
		} else {
			currentTimeInSeconds = newMode === 'Work' ? workDuration : breakDuration;
		}
		isPaused = false; // Always start timer on mode switch unless explicitly paused
	}

	function handleTimerEnd(): void {
		isPaused = true; // Pause timer when it ends
		// Optionally play a sound here using Tone.js if added
		// alert(`${currentTimerMode} session ended!`); // User requested no alerts, use a modal or visual cue

		// Automatic transition (optional, or prompt user)
		if (currentTimerMode === 'Work') {
			// Potentially auto-start break or prompt
			switchToMode('Break');
		} else {
			// Break ended
			// Potentially auto-start work or prompt
			switchToMode('Work');
		}
	}

	function handleUseBreakBank(): void {
		if (currentTimerMode === 'Work' && breakBank > 0) {
			switchToMode('Break', breakBank * 60); // Convert minutes to seconds
			breakBank = 0; // Reset bank after use
		}
	}

	function handleSkipBreak(): void {
		if (currentTimerMode === 'Break') {
			const remainingBreakSeconds = currentTimeInSeconds;
			breakBank += Math.floor(remainingBreakSeconds / 60); // Add remaining whole minutes to bank
			switchToMode('Work');
		}
	}

	function handleToggleState(): void {
		if (currentTimerMode === 'Work') {
			switchToMode('Break');
		} else {
			switchToMode('Work');
		}
	}

	function handleResetTimer(): void {
		currentTimeInSeconds = currentTimerMode === 'Work' ? workDuration : breakDuration;
		isPaused = false; // Start timer immediately on reset
	}
</script>

<div
	class="flex min-h-screen flex-col transition-colors duration-500"
	class:bg-sky-50={currentTimerMode === 'Work' && !isPaused}
	class:dark:bg-slate-900={currentTimerMode === 'Work' && !isPaused}
	class:text-slate-800={!isPaused}
	class:dark:text-slate-200={currentTimerMode === 'Work' && !isPaused}
	class:bg-emerald-50={currentTimerMode === 'Break' && !isPaused}
	class:dark:bg-emerald-950={currentTimerMode === 'Break' && !isPaused}
	class:dark:text-emerald-200={currentTimerMode === 'Break' && !isPaused}
	class:bg-slate-200={isPaused}
	class:dark:bg-slate-800={isPaused}
	class:text-slate-600={isPaused}
	class:dark:text-slate-400={isPaused}
>
	<header
		class="sticky top-0 z-10 p-4 shadow-md"
		class:bg-sky-700={currentTimerMode === 'Work' && !isPaused}
		class:text-sky-50={currentTimerMode === 'Work' && !isPaused}
		class:bg-emerald-700={currentTimerMode === 'Break' && !isPaused}
		class:text-emerald-50={currentTimerMode === 'Break' && !isPaused}
		class:bg-slate-600={isPaused}
		class:text-slate-100={isPaused}
	>
		<div class="container mx-auto flex items-center justify-between">
			<h1 class="text-3xl font-bold">Pomo</h1>
			<div class="text-lg">
				Break Bank: <span class="font-semibold">{breakBank}</span> min
			</div>
		</div>
	</header>

	<div class="container mx-auto flex-grow p-4">
		<TimerDisplay timeInSeconds={currentTimeInSeconds} currentMode={currentTimerMode} />

		<div class="mt-6 grid gap-6 md:grid-cols-12">
			<main class="space-y-6 md:col-span-8">
				<section aria-labelledby="task-form-heading">
					<h2 id="task-form-heading" class="sr-only">Add New Task</h2>
					<TaskForm onCreateTask={addTask} {groups} />
				</section>

				<section aria-labelledby="task-groups-heading">
					<h2 id="task-groups-heading" class="mb-4 text-2xl font-semibold">Your Tasks</h2>
					<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{#each groups as group (group.id)}
							<TaskGroup
								{group}
								tasks={tasksByGroupId(group.id)}
								onToggleComplete={toggleTaskComplete}
								onDelete={deleteTask}
								onDragStartTask={handleDragStartTask}
								onDropInGroup={handleDropOnGroup}
								onDragOverItem={handleDragOverGroupOrItem}
								onDropOnItem={handleDropOnTaskItem}
								onDragEndTask={handleDragEnd}
							/>
						{/each}
					</div>
				</section>
			</main>

			<aside class="md:col-span-4">
				<div class="sticky top-24">
					<h2 class="mb-4 text-2xl font-semibold">Controls</h2>
					<Controls
						{isPaused}
						currentMode={currentTimerMode}
						breakBankAmount={breakBank}
						onPauseResume={handlePauseResume}
						onUseBreakBank={handleUseBreakBank}
						onSkipBreak={handleSkipBreak}
						onToggleState={handleToggleState}
						onResetTimer={handleResetTimer}
					/>
				</div>
			</aside>
		</div>
	</div>

	<footer
		class="mt-8 p-4 text-center text-sm"
		class:text-slate-500={!isPaused}
		class:dark:text-slate-400={!isPaused}
		class:text-slate-400={isPaused}
		class:dark:text-slate-500={isPaused}
	>
		<p>&copy; {new Date().getFullYear()} Pomo App. Built with Svelte 5 & Tailwind CSS.</p>
	</footer>
</div>

<svelte:window
	ondragover={(event) => {
		// This can be useful to see if any dragover is not being handled
		// console.log('Window dragover', event.target);
	}}
	ondrop={(event) => {
		// Prevent default for unhandled drops on window to avoid browser navigation/file opening
		event.preventDefault();
		// console.log('Window drop, unhandled', event.target);
		draggedTaskId = null; // Clear any lingering dragged task ID
	}}
/>
