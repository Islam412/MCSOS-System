// src/components/admin/RoomsManager.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Plus, Edit, Trash2, X, Save, Search, RefreshCw, Loader2, DoorOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useServices } from '../../context/ServiceContext'

export default function RoomsManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { isOnline } = useServices()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [roomForm, setRoomForm] = useState({
    name: '',
    code: '',
    is_active: true
  })

  const API_BASE = 'https://medical-center-app-production.up.railway.app/api/v1'

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    setLoading(true)
    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
      toast.error(isRTL ? 'فشل تحميل الغرف' : 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setRoomForm({
      name: '',
      code: '',
      is_active: true
    })
    setEditingRoom(null)
    setShowRoomModal(true)
  }

  const handleOpenEditModal = (room) => {
    setRoomForm({
      name: room.name,
      code: room.code,
      is_active: room.is_active
    })
    setEditingRoom(room)
    setShowRoomModal(true)
  }

  const handleSaveRoom = async () => {
    if (!roomForm.name || !roomForm.code) {
      toast.error(isRTL ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    const token = localStorage.getItem('mcsos_token')
    const url = editingRoom 
      ? `${API_BASE}/rooms/${editingRoom.id}`
      : `${API_BASE}/rooms`
    const method = editingRoom ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'فشلت العملية')
      }

      toast.success(editingRoom 
        ? (isRTL ? 'تم تحديث الغرفة بنجاح' : 'Room updated successfully')
        : (isRTL ? 'تم إضافة الغرفة بنجاح' : 'Room added successfully')
      )
      setShowRoomModal(false)
      loadRooms()
    } catch (error) {
      toast.error(error.message || (isRTL ? 'حدث خطأ ما' : 'Something went wrong'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRoom = async (id) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الغرفة؟' : 'Are you sure you want to delete this room?')) {
      return
    }

    const token = localStorage.getItem('mcsos_token')
    try {
      const response = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error()
      toast.success(isRTL ? 'تم حذف الغرفة بنجاح' : 'Room deleted successfully')
      loadRooms()
    } catch (error) {
      toast.error(isRTL ? 'فشل حذف الغرفة' : 'Failed to delete room')
    }
  }

  const filteredRooms = rooms.filter(room => 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <DoorOpen size={30} className="text-indigo-600" />
            {isRTL ? 'إدارة الغرف والقاعات' : 'Rooms Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isRTL ? 'إضافة وتعديل غرف الجلسات العلاجية' : 'Manage therapeutic and session rooms'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/10"
        >
          <Plus size={18} />
          {isRTL ? 'إضافة غرفة جديدة' : 'Add New Room'}
        </button>
      </div>

      {/* Search and refresh */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={isRTL ? 'البحث عن غرفة بالاسم أو الرمز...' : 'Search by name or code...'}
            className="w-full pl-3 pr-10 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={loadRooms}
          disabled={loading}
          className="p-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Main Grid list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4 text-indigo-600" size={32} />
          <p>{isRTL ? 'جاري تحميل الغرف...' : 'Loading rooms...'}</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <DoorOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isRTL ? 'لا توجد غرف مضافة حالياً' : 'No rooms found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div 
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <DoorOpen size={24} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    room.is_active 
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30' 
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                  }`}>
                    {room.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                    {room.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {isRTL ? 'الرمز: ' : 'Code: '}{room.code}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                <button
                  onClick={() => handleOpenEditModal(room)}
                  className="flex-1 py-2 px-3 border border-gray-100 hover:bg-yellow-500/10 hover:border-yellow-500/20 text-yellow-500 dark:border-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit size={14} />
                  {isRTL ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="flex-1 py-2 px-3 border border-gray-100 hover:bg-red-500/10 hover:border-red-500/20 text-red-500 dark:border-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} />
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Room */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingRoom ? (isRTL ? 'تعديل الغرفة' : 'Edit Room') : (isRTL ? 'إضافة غرفة جديدة' : 'Add New Room')}
              </h3>
              <button 
                onClick={() => setShowRoomModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  {isRTL ? 'اسم الغرفة *' : 'Room Name *'}
                </label>
                <input
                  type="text"
                  placeholder={isRTL ? 'مثل: غرفة العلاج الطبيعي 1' : 'e.g. Physiotherapy Room 1'}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  {isRTL ? 'رمز الغرفة (فريد) *' : 'Room Code (Unique) *'}
                </label>
                <input
                  type="text"
                  placeholder={isRTL ? 'مثل: ROOM-01' : 'e.g. ROOM-01'}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={roomForm.code}
                  onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={roomForm.is_active}
                  onChange={(e) => setRoomForm({ ...roomForm, is_active: e.target.checked })}
                  disabled={isSubmitting}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  {isRTL ? 'الغرفة نشطة ومتاحة للاستخدام' : 'Room is active and available for use'}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveRoom}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isRTL ? 'حفظ الغرفة' : 'Save'}
                </button>
                <button
                  onClick={() => setShowRoomModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
