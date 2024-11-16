import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Inbox, Briefcase, User, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store';

const iconMap = {
  inbox: Inbox,
  work: Briefcase,
  personal: User,
};

export function Sidebar() {
  const {
    projects,
    activeProject,
    setActiveProject,
    editingProjectId,
    setEditingProjectId,
    deleteProject,
  } = useStore();

  const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="w-64 bg-gray-50 h-screen p-4 border-r border-gray-200">
      <Droppable droppableId="projects" type="project">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {sortedProjects.map((project, index) => {
              const Icon = iconMap[project.id as keyof typeof iconMap] || Plus;

              return (
                <Draggable
                  key={project.id}
                  draggableId={project.id}
                  index={index}
                  isDragDisabled={project.id === 'inbox'}
                >
                  {(provided, snapshot) => (
                    <div>
                      <Droppable
                        droppableId={`project-${project.id}`}
                        type={snapshot.isDragging ? 'project' : 'task-and-group'}
                      >
                        {(dropProvided, dropSnapshot) => (
                          <div
                            ref={dropProvided.innerRef}
                            {...dropProvided.droppableProps}
                            className={`
                              ${dropSnapshot.isDraggingOver ? 'bg-blue-50' : ''}
                              rounded-lg transition-colors
                            `}
                          >
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                                activeProject === project.id
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-100'
                              }`}
                              onClick={() => setActiveProject(project.id)}
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                <Icon
                                  size={20}
                                  style={{
                                    color:
                                      activeProject === project.id ? '#2563eb' : project.color,
                                  }}
                                />
                                <span className="font-medium">{project.name}</span>
                              </div>
                              {project.id !== 'inbox' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProjectId(project.id);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this project?')) {
                                        deleteProject(project.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-red-100 text-red-500 rounded"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                            {dropProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}