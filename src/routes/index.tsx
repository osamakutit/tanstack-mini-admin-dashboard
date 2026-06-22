import { createFileRoute, Link } from '@tanstack/react-router'
import { useStats, useUsers, useTasks } from '../hooks/useAdminQuery'
import { Users, CheckSquare, ShieldCheck, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: users = [] } = useUsers()
  const { data: tasks = [] } = useTasks()

  if (statsLoading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // Get first 3 users and tasks for preview
  const recentUsers = users.slice(0, 3)
  const pendingTasks = tasks.filter((t) => t.status !== 'DONE').slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Welcome Back, Admin</h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Here's what is happening across your projects today. Monitor users, track pending tasks, and verify system status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-semibold">
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-white mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400">
            <TrendingUp size={14} />
            <span>{stats.activeUsers} Active accounts</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-bold text-white mt-2">{stats.totalTasks}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
            <span>{stats.todoTasks} Todo / {stats.inProgressTasks} In Progress</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Completion Rate</p>
              <h3 className="text-2xl font-bold text-white mt-2">{stats.completionRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Services</p>
              <h3 className="text-2xl font-bold text-white mt-2">100%</h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <h4 className="font-semibold text-white">Recent Team Members</h4>
            <Link to="/users" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-semibold text-blue-400 text-sm">
                    {user.avatar}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white">{user.name}</h5>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    user.role === 'Manager' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <h4 className="font-semibold text-white">Active Tasks</h4>
            <Link to="/tasks" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Open Board <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="space-y-1 max-w-[70%]">
                  <h5 className="text-sm font-medium text-white truncate">{task.title}</h5>
                  <p className="text-xs text-gray-400 truncate">{task.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    task.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-700/30 text-gray-400 border border-slate-700/50'
                  }`}>
                    {task.status === 'IN_PROGRESS' ? 'In Progress' : 'Todo'}
                  </span>
                  <span className="text-[10px] text-gray-500">Due: {task.dueDate}</span>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No pending tasks. Great job!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
