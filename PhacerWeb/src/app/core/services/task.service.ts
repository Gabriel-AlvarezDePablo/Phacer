import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  priority: number;
  color: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  color?: number;
  tags?: string[];
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  isCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/api/tasks`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { isCompleted?: boolean; search?: string; priority?: number; tag?: string }) {
    let params = new HttpParams();
    if (filters?.isCompleted !== undefined) params = params.set('isCompleted', filters.isCompleted);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.priority !== undefined) params = params.set('priority', filters.priority);
    if (filters?.tag) params = params.set('tag', filters.tag);
    return this.http.get<TaskResponse[]>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<TaskResponse>(`${this.baseUrl}/${id}`);
  }

  create(task: CreateTaskRequest) {
    return this.http.post<TaskResponse>(this.baseUrl, task);
  }

  update(id: string, task: UpdateTaskRequest) {
    return this.http.put<TaskResponse>(`${this.baseUrl}/${id}`, task);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
