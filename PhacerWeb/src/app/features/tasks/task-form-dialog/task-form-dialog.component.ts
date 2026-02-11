import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TaskResponse } from '../../../core/services/task.service';

export interface TaskFormData {
  task?: TaskResponse;
}

const PRIORITIES = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' }
];

const COLORS = [
  { value: 0, label: 'Gray' },
  { value: 1, label: 'Red' },
  { value: 2, label: 'Blue' },
  { value: 3, label: 'Green' },
  { value: 4, label: 'Yellow' }
];

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.task ? 'Edit Task' : 'New Task' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Task title">
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              @for (p of priorities; track p.value) {
                <mat-option [value]="p.value">{{ p.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Color</mat-label>
            <mat-select formControlName="color">
              @for (c of colors; track c.value) {
                <mat-option [value]="c.value">{{ c.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (data.task) {
          <mat-checkbox formControlName="isCompleted">Completed</mat-checkbox>
        }

        <div class="tags-section">
          <mat-form-field appearance="outline" class="tag-input">
            <mat-label>Tags</mat-label>
            <input matInput #tagInput placeholder="Type and press Enter to add" (keydown.enter)="addTag($event, tagInput)">
          </mat-form-field>
          <mat-chip-set>
            @for (tag of tags; track tag) {
              <mat-chip (removed)="removeTag(tag)">
                {{ tag }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
            }
          </mat-chip-set>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid || submitting">
        {{ data.task ? 'Save' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; display: block; }
    mat-form-field { margin-bottom: 0.5rem; }
    .row { display: flex; gap: 1rem; }
    .row mat-form-field { flex: 1; }
    .tags-section { margin-top: 1rem; }
    .tag-input { width: 100%; }
    mat-chip-set { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    mat-dialog-content { min-width: 400px; padding-top: 0.5rem; }
  `]
})
export class TaskFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  readonly data: TaskFormData = inject(MAT_DIALOG_DATA);

  readonly priorities = PRIORITIES;
  readonly colors = COLORS;
  tags: string[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: [null as Date | null],
    priority: [1],
    color: [0],
    isCompleted: [false]
  });

  constructor() {
    if (this.data.task) {
      this.form.patchValue({
        title: this.data.task.title,
        description: this.data.task.description ?? '',
        dueDate: this.data.task.dueDate ? new Date(this.data.task.dueDate) : null,
        priority: this.data.task.priority,
        color: this.data.task.color,
        isCompleted: this.data.task.isCompleted
      });
      this.tags = [...(this.data.task.tags ?? [])];
    }
  }

  addTag(event: Event, input: HTMLInputElement) {
    event.preventDefault();
    const value = input.value.trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      input.value = '';
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  submit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;

    const value = this.form.value;
    const dueDate = value.dueDate
      ? `${value.dueDate.getFullYear()}-${String(value.dueDate.getMonth() + 1).padStart(2, '0')}-${String(value.dueDate.getDate()).padStart(2, '0')}`
      : undefined;
    const payload = {
      title: value.title.trim(),
      description: value.description?.trim() || undefined,
      dueDate,
      priority: value.priority,
      color: value.color,
      tags: this.tags,
      ...(this.data.task && { isCompleted: value.isCompleted })
    };

    this.dialogRef.close(payload);
  }
}
