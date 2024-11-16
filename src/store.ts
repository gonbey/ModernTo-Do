import { create } from 'zustand';
import { Task, Project, Group } from './types';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  groups: Group[];
  activeProject: string;
  editingGroupId: string | null;
  editingTaskId: string | null;
  editingProjectId: string | null;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  addGroup: (name: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  updateGroupName: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  setEditingGroupId: (id: string | null) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditingProjectId: (id: string | null) => void;
  moveTask: (taskId: string, destinationGroupId: string | undefined, index: number) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number, groupId?: string) => void;
  moveTaskBetweenGroups: (
    taskId: string,
    sourceGroupId: string | undefined,
    destinationGroupId: string | undefined,
    destinationIndex: number
  ) => void;
  moveTaskToProject: (taskId: string, destinationProjectId: string, index: number) => void;
  reorderProjects: (sourceIndex: number, destinationIndex: number) => void;
  moveGroup: (groupId: string, destinationProjectId: string) => void;
  reorderGroups: (sourceIndex: number, destinationIndex: number, projectId: string) => void;
}

export const useStore = create<TaskStore>((set) => ({
  tasks: [],
  groups: [],
  projects: [
    { id: 'inbox', name: 'Inbox', color: '#246fe0', order: 0 },
    { id: 'personal', name: 'Personal', color: '#ff9a14', order: 1 },
    { id: 'work', name: 'Work', color: '#eb4034', order: 2 },
  ],
  activeProject: 'inbox',
  editingGroupId: null,
  editingTaskId: null,
  editingProjectId: null,

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: crypto.randomUUID() }],
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  addProject: (project) =>
    set((state) => {
      const maxOrder = Math.max(...state.projects.map((p) => p.order ?? 0));
      return {
        projects: [
          ...state.projects,
          { ...project, id: crypto.randomUUID(), order: maxOrder + 1 },
        ],
      };
    }),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      tasks: state.tasks.filter((task) => task.projectId !== id),
      groups: state.groups.filter((group) => group.projectId !== id),
      activeProject: state.activeProject === id ? 'inbox' : state.activeProject,
    })),

  setActiveProject: (id) => set({ activeProject: id }),
  setEditingProjectId: (id) => set({ editingProjectId: id }),

  addGroup: (name) =>
    set((state) => ({
      groups: [
        ...state.groups,
        {
          id: crypto.randomUUID(),
          name,
          projectId: state.activeProject,
          collapsed: false,
          order: Math.max(...state.groups.filter(g => g.projectId === state.activeProject).map(g => g.order ?? 0), -1) + 1,
        },
      ],
    })),

  toggleGroupCollapse: (groupId) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
      ),
    })),

  updateGroupName: (groupId, name) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, name } : group
      ),
    })),

  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
      tasks: state.tasks.map((task) =>
        task.groupId === groupId ? { ...task, groupId: undefined } : task
      ),
    })),

  setEditingGroupId: (id) => set({ editingGroupId: id }),
  setEditingTaskId: (id) => set({ editingTaskId: id }),

  moveTask: (taskId, destinationGroupId, index) =>
    set((state) => {
      const newTasks = [...state.tasks];
      const taskIndex = newTasks.findIndex((task) => task.id === taskId);
      const [task] = newTasks.splice(taskIndex, 1);
      task.groupId = destinationGroupId;
      newTasks.splice(index, 0, task);
      return { tasks: newTasks };
    }),

  reorderTasks: (sourceIndex, destinationIndex, groupId) =>
    set((state) => {
      const filteredTasks = state.tasks.filter(
        (task) => task.groupId === groupId && task.projectId === state.activeProject
      );
      const [reorderedTask] = filteredTasks.splice(sourceIndex, 1);
      filteredTasks.splice(destinationIndex, 0, reorderedTask);
      
      const newTasks = state.tasks.map((task) => {
        if (task.groupId === groupId && task.projectId === state.activeProject) {
          return filteredTasks[filteredTasks.findIndex((t) => t.id === task.id)];
        }
        return task;
      });
      
      return { tasks: newTasks };
    }),

  moveTaskBetweenGroups: (taskId, sourceGroupId, destinationGroupId, destinationIndex) =>
    set((state) => {
      const newTasks = [...state.tasks];
      const taskIndex = newTasks.findIndex((task) => task.id === taskId);
      const [task] = newTasks.splice(taskIndex, 1);
      task.groupId = destinationGroupId;
      
      const destinationTasks = newTasks.filter(
        (t) => t.groupId === destinationGroupId && t.projectId === state.activeProject
      );
      destinationTasks.splice(destinationIndex, 0, task);
      
      return {
        tasks: [
          ...newTasks.filter((t) => t.groupId !== destinationGroupId),
          ...destinationTasks,
        ],
      };
    }),

  moveTaskToProject: (taskId, destinationProjectId, index) =>
    set((state) => {
      const newTasks = [...state.tasks];
      const taskIndex = newTasks.findIndex((task) => task.id === taskId);
      const [task] = newTasks.splice(taskIndex, 1);
      task.projectId = destinationProjectId;
      task.groupId = undefined;
      newTasks.splice(index, 0, task);
      return { tasks: newTasks };
    }),

  reorderProjects: (sourceIndex, destinationIndex) =>
    set((state) => {
      const newProjects = [...state.projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const [movedProject] = newProjects.splice(sourceIndex, 1);
      newProjects.splice(destinationIndex, 0, movedProject);
      
      return {
        projects: newProjects.map((project, index) => ({
          ...project,
          order: index,
        })),
      };
    }),

  moveGroup: (groupId, destinationProjectId) =>
    set((state) => {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return state;

      const newGroups = state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              projectId: destinationProjectId,
              order: Math.max(
                ...state.groups
                  .filter((g) => g.projectId === destinationProjectId)
                  .map((g) => g.order ?? 0),
                -1
              ) + 1,
            }
          : g
      );

      const newTasks = state.tasks.map((task) =>
        task.groupId === groupId
          ? { ...task, projectId: destinationProjectId }
          : task
      );

      return { groups: newGroups, tasks: newTasks };
    }),

  reorderGroups: (sourceIndex, destinationIndex, projectId) =>
    set((state) => {
      const projectGroups = [...state.groups]
        .filter((g) => g.projectId === projectId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const [movedGroup] = projectGroups.splice(sourceIndex, 1);
      projectGroups.splice(destinationIndex, 0, movedGroup);

      const newGroups = state.groups.map((group) => {
        if (group.projectId !== projectId) return group;
        const index = projectGroups.findIndex((g) => g.id === group.id);
        return { ...group, order: index };
      });

      return { groups: newGroups };
    }),
}));