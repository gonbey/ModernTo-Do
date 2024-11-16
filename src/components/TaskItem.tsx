import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, Trash2, Flag, Edit2, Check, X, Calendar } from 'lucide-react';
import { Task } from '../types';
import { useStore } from '../store';

const priorityColors = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-blue-500',
  4: 'text-gray-400',
};

interface TaskItemProps {
  task: Task;
  index: number;
}

export function TaskItem({ task, index }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask, editingTaskId, setEditingTaskId } = useStore();
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingTaskId === task.id;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editedTitle.trim()) {
      updateTask(task.id, {
        title: editedTitle.trim(),
        dueDate: editedDueDate ? new Date(editedDueDate) : undefined,
      });
    }
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setEditingTaskId(null);
    }
  };

  const formatDueDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={() => toggleTask(task.id)}
              className={`transition-colors ${
                task.completed ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-1 border rounded"
                />
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  className="px-2 py-1 border rounded"
                />
                <button
                  onClick={handleSave}
                  className="p-1 hover:bg-green-100 text-green-600 rounded"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(task.title);
                    setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                    setEditingTaskId(null);
                  }}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 flex-1">
                <span
                  className={`font-medium ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDueDate(task.dueDate)}
                  </span>
                )}
              </div>
            )}
            <Flag
              size={16}
              className={`${priorityColors[task.priority]} ${
                task.priority === 4 ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
              <button
                onClick={() => setEditingTaskId(task.id)}
                className="p-1 hover:bg-gray-100 text-gray-500 rounded"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 hover:bg-red-100 text-red-500 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}