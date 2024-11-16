import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { AddTask } from './components/AddTask';
import { useStore } from './store';

function App() {
  const {
    moveTaskToProject,
    moveGroup,
    reorderProjects,
    moveTaskBetweenGroups,
    reorderTasks,
    reorderGroups,
  } = useStore();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    
    if (!destination) return;

    // Handle project reordering
    if (type === 'project') {
      reorderProjects(source.index, destination.index);
      return;
    }

    // Handle drops on project sidebar
    if (destination.droppableId.startsWith('project-')) {
      const destinationProjectId = destination.droppableId.replace('project-', '');
      if (type === 'task') {
        moveTaskToProject(draggableId, destinationProjectId, 0);
      } else if (type === 'group') {
        moveGroup(draggableId.replace('group-', ''), destinationProjectId);
      }
      return;
    }

    // Handle task reordering and movement between groups
    if (type === 'task') {
      const sourceGroupId = source.droppableId === 'ungrouped' ? undefined : source.droppableId;
      const destinationGroupId = destination.droppableId === 'ungrouped' ? undefined : destination.droppableId;

      if (source.droppableId === destination.droppableId) {
        reorderTasks(source.index, destination.index, sourceGroupId);
      } else {
        moveTaskBetweenGroups(
          draggableId,
          sourceGroupId,
          destinationGroupId,
          destination.index
        );
      }
      return;
    }

    // Handle group reordering
    if (type === 'group') {
      reorderGroups(source.index, destination.index, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <TaskList />
          </div>
          <AddTask />
        </main>
      </div>
    </DragDropContext>
  );
}

export default App;