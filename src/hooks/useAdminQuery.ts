import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Member' | 'Manager'
  status: 'Active' | 'Inactive'
  avatar: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assigneeId: string
  dueDate: string
}

// Initial mock data if localStorage is empty
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Alexander Wright', email: 'alex@company.com', role: 'Admin', status: 'Active', avatar: 'AW' },
  { id: '2', name: 'Sophia Chen', email: 'sophia@company.com', role: 'Manager', status: 'Active', avatar: 'SC' },
  { id: '3', name: 'Marcus Brody', email: 'marcus@company.com', role: 'Member', status: 'Active', avatar: 'MB' },
  { id: '4', name: 'Elena Rostova', email: 'elena@company.com', role: 'Member', status: 'Inactive', avatar: 'ER' },
  { id: '5', name: 'David Kim', email: 'david@company.com', role: 'Member', status: 'Active', avatar: 'DK' },
]

const INITIAL_TASKS: Task[] = [
  { id: '101', title: 'Design marketing landing page', description: 'Create high fidelity wireframes and visual design mockups in Figma.', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: '2', dueDate: '2026-07-10' },
  { id: '102', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated linting, testing, and deployment to staging.', status: 'TODO', priority: 'MEDIUM', assigneeId: '1', dueDate: '2026-07-15' },
  { id: '103', title: 'Optimize MySQL queries', description: 'Analyze slow queries and add proper indexes on the inventory reports table.', status: 'DONE', priority: 'HIGH', assigneeId: '5', dueDate: '2026-06-28' },
  { id: '104', title: 'Write integration API doc', description: 'Document the ERPNext sync script steps, triggers, and payload format in README.', status: 'TODO', priority: 'LOW', assigneeId: '3', dueDate: '2026-07-20' },
]

// Initialize helper
const getStore = <T>(key: string, initial: T[]): T[] => {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(data)
}

const saveStore = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data))
}

// React Query hooks
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => getStore<User>('mock_users', INITIAL_USERS),
  })
}

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => getStore<Task>('mock_tasks', INITIAL_TASKS),
  })
}

export function useStats() {
  const { data: users = [] } = useUsers()
  const { data: tasks = [] } = useTasks()

  return useQuery({
    queryKey: ['stats', users.length, tasks.length],
    queryFn: () => {
      const activeUsers = users.filter((u) => u.status === 'Active').length
      const completedTasks = tasks.filter((t) => t.status === 'DONE').length
      const todoTasks = tasks.filter((t) => t.status === 'TODO').length
      const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length

      const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

      return {
        totalUsers: users.length,
        activeUsers,
        totalTasks: tasks.length,
        todoTasks,
        inProgressTasks,
        completedTasks,
        completionRate,
      }
    },
  })
}

// Mutations
export function useAddUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newUser: Omit<User, 'id' | 'avatar'>) => {
      const list = getStore<User>('mock_users', INITIAL_USERS)
      const initials = newUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      const userWithId: User = {
        ...newUser,
        id: Math.random().toString(36).substring(2, 9),
        avatar: initials || 'UN',
      }
      list.push(userWithId)
      saveStore('mock_users', list)
      return userWithId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updatedUser: User) => {
      const list = getStore<User>('mock_users', INITIAL_USERS)
      const index = list.findIndex((u) => u.id === updatedUser.id)
      if (index !== -1) {
        list[index] = updatedUser
        saveStore('mock_users', list)
      }
      return updatedUser
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const list = getStore<User>('mock_users', INITIAL_USERS)
      const filtered = list.filter((u) => u.id !== id)
      saveStore('mock_users', filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useAddTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const list = getStore<Task>('mock_tasks', INITIAL_TASKS)
      const taskWithId: Task = {
        ...newTask,
        id: Math.random().toString(36).substring(2, 9),
      }
      list.push(taskWithId)
      saveStore('mock_tasks', list)
      return taskWithId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updatedTask: Task) => {
      const list = getStore<Task>('mock_tasks', INITIAL_TASKS)
      const index = list.findIndex((t) => t.id === updatedTask.id)
      if (index !== -1) {
        list[index] = updatedTask
        saveStore('mock_tasks', list)
      }
      return updatedTask
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const list = getStore<Task>('mock_tasks', INITIAL_TASKS)
      const filtered = list.filter((t) => t.id !== id)
      saveStore('mock_tasks', filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
