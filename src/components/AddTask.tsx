import React, { useState } from 'react';
import { Plus, Flag, Calendar } from 'lucide-react';
import { useStore } from '../store';

export function AddTask() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [dueDate, setDueDate] = useState('');
  const { addTask, activeProject } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      completed: false,
      priority,
      projectId: activeProject,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    setTitle('');
    setPriority(4);
    setDueDate('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 p-4 bg-white border-t border-gray-200"
    >
      <div className="flex items-center space-x-4">
        <Plus size={20} className="text-gray-400" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-transparent outline-none placeholder-gray-400"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-1 rounded border border-gray-200 text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3 | 4)}
          className="p-1 rounded border border-gray-200 text-sm"
        >
          <option value={4}>P4</option>
          <option value={3}>P3</option>
          <option value={2}>P2</option>
          <option value={1}>P1</option>
        </select>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}