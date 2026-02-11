import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService, TaskResponse } from '../../../core/services/task.service';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';

const PRIORITY_LABELS: Record<number, string> = { 0: 'Low', 1: 'Medium', 2: 'High' };
const COLOR_CLASSES: Record<number, string> = { 0: 'gray', 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow' };

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Phacer</span>
      <span class="spacer"></span>
      <span class="user-email">{{ auth.user()?.email }}</span>
      <button mat-icon-button (click)="auth.logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="search" (ngModelChange)="loadTasks()" placeholder="Search tasks...">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadTasks()">
            <mat-option [value]="null">All</mat-option>
            <mat-option [value]="false">Active</mat-option>
            <mat-option [value]="true">Completed</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Task
        </button>
      </div>

      <div class="task-list">
        @for (task of tasks(); track task.id) {
          <mat-card class="task-card" [class.completed]="task.isCompleted">
            <mat-card-content>
              <mat-checkbox [checked]="task.isCompleted" (change)="toggleComplete(task)"></mat-checkbox>
              <div class="task-body">
                <span class="task-title" [class.done]="task.isCompleted">{{ task.title }}</span>
                @if (task.description) {
                  <span class="task-desc">{{ task.description }}</span>
                }
                @if (task.dueDate) {
                  <span class="task-due">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                }
                <div class="task-meta">
                  @if (task.tags && task.tags.length) {
                    <mat-chip-set>
                      @for (tag of task.tags; track tag) {
                        <mat-chip>{{ tag }}</mat-chip>
                      }
                    </mat-chip-set>
                  }
                  <span class="priority" [class]="COLOR_CLASSES[task.color] || 'gray'">
                    {{ PRIORITY_LABELS[task.priority] || 'Medium' }}
                  </span>
                </div>
              </div>
              <div class="task-actions">
                <button mat-icon-button (click)="editTask(task)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteTask(task)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        } @empty {
          <p class="empty">No tasks yet. Add your first task!</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .user-email { font-size: 0.875rem; margin-right: 0.5rem; }
    .container { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
    .filters mat-form-field { min-width: 150px; }
    .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .task-card { }
    .task-card.completed .task-title { text-decoration: line-through; opacity: 0.7; }
    .task-card mat-card-content { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem !important; }
    .task-body { flex: 1; min-width: 0; }
    .task-title { font-weight: 500; display: block; }
    .task-desc { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); display: block; margin-top: 0.25rem; }
    .task-due { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); display: block; margin-top: 0.25rem; }
    .task-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; }
    .priority { font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .priority.gray { background: #9e9e9e33; }
    .priority.red { background: #f4433633; }
    .priority.blue { background: #2196f333; }
    .priority.green { background: #4caf5033; }
    .priority.yellow { background: #ffeb3b33; }
    .task-actions { display: flex; gap: 0; }
    .empty { text-align: center; padding: 3rem; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class TaskListComponent implements OnInit {
  readonly PRIORITY_LABELS = PRIORITY_LABELS;
  readonly COLOR_CLASSES = COLOR_CLASSES;

  tasks = signal<TaskResponse[]>([]);
  search = '';
  statusFilter: boolean | null = null;

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getAll({
      search: this.search || undefined,
      isCompleted: this.statusFilter ?? undefined
    }).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.tasks.set([])
    });
  }

  toggleComplete(task: TaskResponse) {
    this.taskService.update(task.id, {
      title: task.title,
      description: task.description ?? undefined,
      dueDate: task.dueDate ?? undefined,
      isCompleted: !task.isCompleted,
      priority: task.priority,
      color: task.color,
      tags: task.tags ?? []
    }).subscribe({
      next: () => this.loadTasks()
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '480px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.create(result).subscribe({
          next: () => this.loadTasks()
        });
      }
    });
  }

  editTask(task: TaskResponse) {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '480px',
      data: { task }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.update(task.id, { ...result, isCompleted: result.isCompleted ?? task.isCompleted }).subscribe({
          next: () => this.loadTasks()
        });
      }
    });
  }

  deleteTask(task: TaskResponse) {
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.delete(task.id).subscribe({
        next: () => this.loadTasks()
      });
    }
  }
}
