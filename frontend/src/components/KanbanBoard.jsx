import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTasks } from '../context/TaskContext.jsx';
import TaskCard from './TaskCard.jsx';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

function KanbanBoard({ onEditTask }) {
  const { tasks, moveTask, getTasksByColumn, createTask } = useTasks();

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleQuickAdd = (columnId) => {
    const title = prompt('Enter task title:');
    if (title && title.trim()) {
      createTask({
        title: title.trim(),
        column: columnId,
        priority: 'medium',
        category: 'feature',
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" data-testid="kanban-board">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByColumn(column.id);
          
          return (
            <div
              key={column.id}
              className="bg-gray-200 dark:bg-gray-800 rounded-xl p-4 min-h-[400px]"
              data-testid={`column-${column.id}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h2 className="font-semibold text-gray-800 dark:text-white">
                    {column.title}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-300 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleQuickAdd(column.id)}
                  className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Quick add task"
                  data-testid={`quick-add-${column.id}`}
                >
                  <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[300px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : ''
                    }`}
                    data-testid={`droppable-${column.id}`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-90' : ''}
                          >
                            <TaskCard
                              task={task}
                              onEdit={() => onEditTask(task)}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                        <p className="text-sm">No tasks yet</p>
                        <p className="text-xs mt-1">Drop a task here or click + to add</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
