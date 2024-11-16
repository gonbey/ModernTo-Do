import React, { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Edit2, Trash2, Check, X } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { useStore } from '../store';

interface TaskGroupProps {
  groupId: string;
  name: string;
  tasks: Task[];
  collapsed: boolean;
  index: number;
}

export function TaskGroup({ groupId, name, tasks, collapsed, index }: TaskGroupProps) {
  const {
    toggleGroupCollapse,
    updateGroupName,
    deleteGroup,
    editingGroupId,
    setEditingGroupId,
  } = useStore();
  const [editedName, setEditedName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingGroupId === groupId;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editedName.trim()) {
      updateGroupName(groupId, editedName.trim());
    }
    setEditingGroupId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedName(name);
      setEditingGroupId(null);
    }
  };

  return (
    <Draggable draggableId={`group-${groupId}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="space-y-2"
        >
          <div className="flex items-center justify-between group">
            <div
              {...provided.dragHandleProps}
              className="flex items-center space-x-2"
            >
              <button
                onClick={() => toggleGroupCollapse(groupId)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {collapsed ? (
                  <ChevronRight size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                      setEditedName(name);
                      setEditingGroupId(null);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <span className="font-medium text-gray-700">{name}</span>
              )}
            </div>
            {!isEditing && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                <button
                  onClick={() => setEditingGroupId(groupId)}
                  className="p-1 hover:bg-gray-100 text-gray-500 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteGroup(groupId)}
                  className="p-1 hover:bg-red-100 text-red-500 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          {!collapsed && (
            <Droppable droppableId={groupId} type="task">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="ml-8 space-y-2"
                >
                  {tasks.map((task, index) => (
                    <TaskItem key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}