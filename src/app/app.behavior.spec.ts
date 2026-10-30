import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App task management', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [App] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adds a trimmed task and persists completion changes', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const app = fixture.componentInstance;
    const input = document.createElement('input');
    input.value = '  Planejar a semana  ';
    const event = new Event('submit', { cancelable: true });

    app.addTask(event, input);

    expect(event.defaultPrevented).toBe(true);
    expect(app.tasks()).toEqual([
      { id: 1, title: 'Planejar a semana', completed: false },
    ]);
    expect(input.value).toBe('');

    app.toggleTask(1);

    expect(app.completedCount()).toBe(1);
    expect(app.progress()).toBe(100);
    expect(localStorage.getItem('organiza.tasks.v1')).toContain(
      '"completed":true',
    );

    fixture.destroy();
  });

  it('filters tasks and clears completed items', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.tasks.set([
      { id: 1, title: 'Revisar tarefas', completed: false },
      { id: 2, title: 'Concluir relatório', completed: true },
    ]);

    app.filter.set('open');
    expect(app.filteredTasks().map((task) => task.id)).toEqual([1]);

    app.filter.set('done');
    expect(app.filteredTasks().map((task) => task.id)).toEqual([2]);

    app.clearCompleted();
    expect(app.tasks().map((task) => task.id)).toEqual([1]);
    expect(app.progress()).toBe(0);

    fixture.destroy();
  });
});
