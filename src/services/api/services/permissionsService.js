import { get, put } from '../client'

export const permissionsService = {
  getCatalogue: () => get('/api/v1/permissions'),

  getEffective: () => get('/api/v1/permissions/effective'),

  getRolePermissions: (role) => get(`/api/v1/roles/${role}/permissions`),

  setRolePermissions: (role, permissions) =>
    put(`/api/v1/roles/${role}/permissions`, { permissions }),

  getUserPermissions: (userId) => get(`/api/v1/users/${userId}/permissions`),

  setUserPermissions: (userId, permissions) =>
    put(`/api/v1/users/${userId}/permissions`, { permissions }),
}
