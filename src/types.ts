export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4;
  projectId: string;
  dueDate?: Date;
  notes?: string;
  groupId?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Group {
  id: string;
  name: string;
  projectId: string;
  collapsed: boolean;
  order: number;
}