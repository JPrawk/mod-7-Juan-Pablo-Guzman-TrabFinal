export interface Task { 
  id: number;
  name: string;
  done: boolean;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  name: string;
}

export interface UpdateTaskDto {
  name: string;
}

export interface PatchTaskDto {
      done: boolean;
}