import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

type TaskFilter = 'all' | 'open' | 'done';

const STORAGE_KEY = 'organiza.tasks.v1';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task['id'] === 'number' &&
    Number.isInteger(task['id']) &&
    typeof task['title'] === 'string' &&
    typeof task['completed'] === 'boolean'
  );
}

function isTaskList(value: unknown): value is Task[] {
  if (!Array.isArray(value) || !value.every(isTask)) {
    return false;
  }

  return new Set(value.map((task: Task) => task.id)).size === value.length;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly tasks = signal<Task[]>([]);
  readonly filter = signal<TaskFilter>('all');
  readonly storageError = signal<string | null>(null);
  readonly taskCount = computed(() => this.tasks().length);
  readonly completedCount = computed(
    () => this.tasks().filter((task) => task.completed).length,
  );
  readonly remainingCount = computed(
    () => this.taskCount() - this.completedCount(),
  );
  readonly progress = computed(() =>
    this.taskCount() === 0
      ? 0
      : Math.round((this.completedCount() / this.taskCount()) * 100),
  );
  readonly filteredTasks = computed(() => {
    const filter = this.filter();

    if (filter === 'open') {
      return this.tasks().filter((task) => !task.completed);
    }

    if (filter === 'done') {
      return this.tasks().filter((task) => task.completed);
    }

    return this.tasks();
  });
  readonly filters: ReadonlyArray<{ value: TaskFilter; label: string }> = [
    { value: 'all', label: 'Todas' },
    { value: 'open', label: 'A fazer' },
    { value: 'done', label: 'Concluídas' },
  ];

  private nextId = 1;

  constructor() {
    afterNextRender(() => this.restoreTasks());
  }

  addTask(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const title = input.value.trim();

    if (!title) {
      input.focus();
      return;
    }

    this.tasks.update((tasks) => [
      { id: this.nextId++, title, completed: false },
      ...tasks,
    ]);
    input.value = '';
    this.saveTasks();
    input.focus();
  }

  toggleTask(id: number): void {
    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
    this.saveTasks();
  }

  removeTask(id: number): void {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
    this.saveTasks();
  }

  clearCompleted(): void {
    this.tasks.update((tasks) => tasks.filter((task) => !task.completed));
    this.saveTasks();
  }

  private restoreTasks(): void {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY);

      if (savedTasks === null) {
        return;
      }

      const parsed: unknown = JSON.parse(savedTasks);

      if (!isTaskList(parsed)) {
        throw new Error('Os dados salvos não têm um formato válido.');
      }

      this.tasks.set(parsed);
      this.nextId = Math.max(0, ...parsed.map((task) => task.id)) + 1;
    } catch (error) {
      console.error('Não foi possível carregar suas tarefas salvas.', error);
      this.storageError.set(
        'Não foi possível carregar as tarefas salvas neste dispositivo.',
      );
    }
  }

  private saveTasks(): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
      this.storageError.set(null);
    } catch (error) {
      console.error('Não foi possível salvar suas tarefas.', error);
      this.storageError.set(
        'Não foi possível salvar as alterações. Verifique o armazenamento do navegador.',
      );
    }
  }
}
