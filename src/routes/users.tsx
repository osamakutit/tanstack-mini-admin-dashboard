import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useUsers, useAddUser, useUpdateUser, useDeleteUser } from '../hooks/useAdminQuery'
import type { User } from '../hooks/useAdminQuery'
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/users')({
  component: UsersView,
})

function UsersView() {
  const { data: users = [], isLoading } = useUsers()
  const addUserMutation = useAddUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // null means creating
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<'Admin' | 'Member' | 'Manager'>('Member')
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')

  const openAddModal = () => {
    setCurrentUser(null)
    setFormName('')
    setFormEmail('')
    setFormRole('Member')
    setFormStatus('Active')
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormStatus(user.status)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser) {
      // Edit mode
      updateUserMutation.mutate({
        ...currentUser,
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
      }, {
        onSuccess: () => setIsModalOpen(false)
      })
    } else {
      // Add mode
      addUserMutation.mutate({
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
      }, {
        onSuccess: () => setIsModalOpen(false)
      })
    }
  }

  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteConfirmOpen(true)
  }

  const handleDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setIsDeleteConfirmOpen(false)
          setUserToDelete(null)
        }
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role.toUpperCase() === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b1329]/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0b1329]/80 border border-slate-800 text-gray-300 py-2.5 px-4 rounded-xl text-sm focus:outline-none focus:border-blue-500/80 transition-colors cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>

        {/* Add User Button */}
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
                          {user.avatar}
                        </div>
                        <span className="font-semibold text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wider uppercase ${
                        user.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        user.role === 'Manager' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                        user.status === 'Active' ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No team members found matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <h4 className="font-bold text-white text-base">
                {currentUser ? 'Edit Member Profile' : 'Add New Member'}
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
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Liam Smith"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. liam@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  disabled={addUserMutation.isPending || updateUserMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
                >
                  Save Profile
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
              <h4 className="font-bold text-white text-base">Remove Member?</h4>
            </div>

            <p className="text-sm text-gray-400">
              Are you sure you want to remove <span className="font-semibold text-white">{userToDelete?.name}</span>? This action cannot be undone.
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
                onClick={handleDelete}
                disabled={deleteUserMutation.isPending}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
