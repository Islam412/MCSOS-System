import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, Users, DollarSign, Activity, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Reception', icon: Users },
  { to: '/doctor', label: 'Doctor', icon: Activity },
  { to: '/finance', label: 'Finance', icon: DollarSign },
  { to: '/operations', label: 'Operations', icon: Calendar },
]

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 font-bold text-xl border-b">MCSOS</div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 text-red-600 w-full hover:bg-red-50 p-2 rounded-lg">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}