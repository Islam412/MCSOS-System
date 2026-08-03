// src/pages/admin/RbacManagerPage.jsx
import React from 'react'
import RbacPermissionsMatrix from '../../components/admin/RbacPermissionsMatrix'

export default function RbacManagerPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <RbacPermissionsMatrix />
    </div>
  )
}
