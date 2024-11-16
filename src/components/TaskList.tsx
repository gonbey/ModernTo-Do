import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { FolderPlus } from 'lucide-react';
import { useStore } from '../store';
import { TaskGroup } from './TaskGroup';
import { TaskItem } from './TaskItem';

export function TaskList() {
  const {
    tasks,
    groups,
    activeProject,
    addGroup,
  } = useStore();
  
  const projectGroups = groups
    .filter((group) => group.projectId === activeProject)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const ungroupedTasks = tasks.filter(
    (task) => task.projectId === activeProject && !task.groupId
  );

  const handleAddGroup = () => {
    const name = prompt('Enter group name:');
    if (name?.trim()) {
      addGroup(name.trim());
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <button
          onClick={handleAddGroup}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FolderPlus size={16} />
          <span>Add Group</span>
        </button>
      </div>
      
      <div className="space-y-6">
        <Droppable droppableId="groups" type="group">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {projectGroups.map((group, index) => (
                <React.Fragment key={group.id}>
                  <TaskGroup
                    groupId={group.id}
                    name={group.name}
                    tasks={tasks.filter((task) => task.groupId === group.id)}
                    collapsed={group.collapsed}
                    index={index}
                  />
                  <Droppable droppableId={`between-${group.id}`} type="task">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-2 my-2 rounded transition-all ${
                          snapshot.isDraggingOver ? 'bg-blue-100' : ''
                        }`}
                      >
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        <Droppable droppableId="ungrouped" type="task">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {ungroupedTasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}