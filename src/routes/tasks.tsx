import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTasks, useUsers, useAddTask, useUpdateTask, useDeleteTask } from '../hooks/useAdminQuery'
import type { Task } from '../hooks/useAdminQuery'
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/tasks')({
  component: TasksView,
})

function TasksView() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks()
  const { data: users = [], isLoading: usersLoading } = useUsers()
  
  const addTaskMutation = useAddTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null) // null = Add
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStatus, setFormStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
  const [formPriority, setFormPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [formAssigneeId, setFormAssigneeId] = useState('')
  const [formDueDate, setFormDueDate] = useState('')

  const openAddTaskModal = (initialStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    setCurrentTask(null)
    setFormTitle('')
    setFormDescription('')
    setFormStatus(initialStatus || 'TODO')
    setFormPriority('LOW')
    setFormAssigneeId(users[0]?.id || '')
    setFormDueDate(new Date().toISOString().split('T')[0])
    setIsModalOpen(true)
  }

  const openEditTaskModal = (task: Task) => {
    setCurrentTask(task)
    setFormTitle(task.title)
    setFormDescription(task.description)
    setFormStatus(task.status)
    setFormPriority(task.priority)
    setFormAssigneeId(task.assigneeId)
    setFormDueDate(task.dueDate)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentTask) {
      updateTaskMutation.mutate({
        ...currentTask,
        title: formTitle,
        description: formDescription,
        status: formStatus,
        priority: formPriority,
        assigneeId: formAssigneeId,
        dueDate: formDueDate,
      }, {
        onSuccess: () => setIsModalOpen(false)
      })
    } else {
      addTaskMutation.mutate({
        title: formTitle,
        description: formDescription,
        status: formStatus,
        priority: formPriority,
        assigneeId: formAssigneeId,
        dueDate: formDueDate,
      }, {
        onSuccess: () => setIsModalOpen(false)
      })
    }
  }

  const moveTaskStatus = (task: Task, direction: 'forward' | 'backward') => {
    const statusOrder: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE']
    const currentIndex = statusOrder.indexOf(task.status)
    let newIndex = currentIndex
    
    if (direction === 'forward' && currentIndex < 2) newIndex += 1
    if (direction === 'backward' && currentIndex > 0) newIndex -= 1

    if (newIndex !== currentIndex) {
      updateTaskMutation.mutate({
        ...task,
        status: statusOrder[newIndex],
      })
    }
  }

  const confirmDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id, {
        onSuccess: () => {
          setIsDeleteConfirmOpen(false)
          setTaskToDelete(null)
        }
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.description.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  // Group tasks by status
  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')

  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id)
    return user ? user.name : 'Unassigned'
  }

  const getInitials = (id: string) => {
    const user = users.find((u) => u.id === id)
    return user ? user.avatar : 'UN'
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b1329]/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0b1329]/80 border border-slate-800 text-gray-300 py-2.5 px-4 rounded-xl text-sm focus:outline-none focus:border-blue-500/80 transition-colors cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        <button
          onClick={() => openAddTaskModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {tasksLoading || usersLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: TODO */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                <h4 className="font-bold text-white text-sm">To Do</h4>
                <span className="ml-1 text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
              </div>
              <button
                onClick={() => openAddTaskModal('TODO')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-slate-800 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px]">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  getUserName={getUserName}
                  getInitials={getInitials}
                  onEdit={openEditTaskModal}
                  onDelete={confirmDeleteTask}
                  onMove={moveTaskStatus}
                />
              ))}
              {todoTasks.length === 0 && <EmptyStateCol />}
            </div>
          </div>

          {/* Column 2: IN_PROGRESS */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-white text-sm">In Progress</h4>
                <span className="ml-1 text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <button
                onClick={() => openAddTaskModal('IN_PROGRESS')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-slate-800 rounded"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px]">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  getUserName={getUserName}
                  getInitials={getInitials}
                  onEdit={openEditTaskModal}
                  onDelete={confirmDeleteTask}
                  onMove={moveTaskStatus}
                />
              ))}
              {inProgressTasks.length === 0 && <EmptyStateCol />}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <h4 className="font-bold text-white text-sm">Completed</h4>
                <span className="ml-1 text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">{doneTasks.length}</span>
              </div>
              <button
                onClick={() => openAddTaskModal('DONE')}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-slate-800 rounded"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px]">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  getUserName={getUserName}
                  getInitials={getInitials}
                  onEdit={openEditTaskModal}
                  onDelete={confirmDeleteTask}
                  onMove={moveTaskStatus}
                />
              ))}
              {doneTasks.length === 0 && <EmptyStateCol />}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <h4 className="font-bold text-white text-base">
                {currentTask ? 'Edit Task Details' : 'Create New Task'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Implement Oauth flow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Explain the goals of this task..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Column</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Assignee</label>
                  <select
                    value={formAssigneeId}
                    onChange={(e) => setFormAssigneeId(e.target.value)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addTaskMutation.isPending || updateTaskMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-bold text-white text-base">Delete Task?</h4>
            </div>

            <p className="text-sm text-gray-400">
              Are you sure you want to delete <span className="font-semibold text-white">"{taskToDelete?.title}"</span>? This cannot be undone.
            </p>

            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={deleteTaskMutation.isPending}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Subcomponent: TaskCard
interface TaskCardProps {
  task: Task
  getUserName: (id: string) => string
  getInitials: (id: string) => string
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onMove: (task: Task, direction: 'forward' | 'backward') => void
}

function TaskCard({ task, getUserName, getInitials, onEdit, onDelete, onMove }: TaskCardProps) {
  return (
    <div className="bg-[#10192e] border border-slate-800/80 rounded-xl p-4.5 space-y-3.5 shadow hover:shadow-lg hover:border-slate-700/80 transition-all group">
      {/* Priority Badge & Options */}
      <div className="flex justify-between items-center">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          task.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
          task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
          'bg-green-500/10 text-green-400 border border-green-500/10'
        }`}>
          {task.priority} Priority
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Edit">
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(task)} className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h5 className="font-semibold text-white text-sm line-clamp-1">{task.title}</h5>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
      </div>

      {/* Footer (Assignee Initials, Due Date, Move Controls) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-400" title={getUserName(task.assigneeId)}>
            {getInitials(task.assigneeId)}
          </div>
          <span className="text-[10px] text-gray-400">{task.dueDate}</span>
        </div>

        {/* Move buttons */}
        <div className="flex items-center gap-1">
          {task.status !== 'TODO' && (
            <button
              onClick={() => onMove(task, 'backward')}
              className="p-1 hover:bg-slate-800 rounded text-gray-400 hover:text-white cursor-pointer"
              title="Move backward"
            >
              <ArrowLeft size={12} />
            </button>
          )}
          {task.status !== 'DONE' && (
            <button
              onClick={() => onMove(task, 'forward')}
              className="p-1 hover:bg-slate-800 rounded text-gray-400 hover:text-white cursor-pointer"
              title="Move forward"
            >
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyStateCol() {
  return (
    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-800 rounded-xl text-center p-4">
      <p className="text-xs text-gray-500">No tasks in this column</p>
    </div>
  )
}
