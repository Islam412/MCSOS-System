import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Printer, Download, Plus, Trash2, Edit, Save, X, Search, User, Calendar, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceManager() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const currentLang = i18n.language

  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPatients, setFilteredPatients] = useState([])

  // بيانات العيادة
  const [clinicInfo, setClinicInfo] = useState({
    nameAr: 'مركز الطب الحديث',
    nameEn: 'Modern Medical Center',
    addressAr: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
    addressEn: 'King Fahd Road, Riyadh, Saudi Arabia',
    phone: '+966 12 345 6789',
    email: 'info@modernmedical.com',
    taxNumber: '123456789',
    commercialRegister: 'CR-123456'
  })

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientPhone: '',
    invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    procedureType: 'surgery',
    procedureName: '',
    procedureDescription: '',
    diagnosis: '',
    doctorName: '',
    anesthesia: '',
    roomType: 'normal',
    surgeryDate: '',
    surgeryTime: '',
    hospitalName: '',
    items: [
      { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    tax: 0,
    taxRate: 15,
    total: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    notes: ''
  })

  // تحميل البيانات
  useEffect(() => {
    loadPatients()
    loadInvoices()
    loadClinicInfo()
  }, [])

  const loadPatients = () => {
    const saved = localStorage.getItem('mcsos_patients_v2')
    if (saved) {
      const allPatients = JSON.parse(saved)
      setPatients(allPatients)
      setFilteredPatients(allPatients)
    }
    setLoading(false)
  }

  const loadInvoices = () => {
    const saved = localStorage.getItem('mcsos_invoices')
    if (saved) {
      setInvoices(JSON.parse(saved))
    }
  }

  const loadClinicInfo = () => {
    const saved = localStorage.getItem('mcsos_clinic_info')
    if (saved) {
      setClinicInfo(JSON.parse(saved))
    }
  }

  const saveInvoices = (data) => {
    localStorage.setItem('mcsos_invoices', JSON.stringify(data))
    setInvoices(data)
  }

  const handleSearchPatient = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term.length > 1) {
      const filtered = patients.filter(p => 
        (p.nameAr && p.nameAr.includes(term)) || 
        (p.nameEn && p.nameEn.includes(term)) ||
        (p.phone && p.phone.includes(term))
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }

  const handleSelectPatient = (patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: currentLang === 'ar' ? patient.nameAr : patient.nameEn,
      patientAge: patient.age,
      patientPhone: patient.phone || ''
    })
    setSearchTerm('')
    setFilteredPatients(patients)
  }

  const handleAddItem = () => {
    const newId = Math.max(...formData.items.map(i => i.id), 0) + 1
    setFormData({
      ...formData,
      items: [...formData.items, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    })
  }

  const handleRemoveItem = (id) => {
    if (formData.items.length === 1) {
      toast.error('يجب وجود عنصر واحد على الأقل')
      return
    }
    const newItems = formData.items.filter(i => i.id !== id)
    const updatedForm = { ...formData, items: newItems }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const handleItemChange = (id, field, value) => {
    const newItems = formData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (updated.quantity || 0) * (updated.unitPrice || 0)
        }
        return updated
      }
      return item
    })
    const updatedForm = { ...formData, items: newItems }
    calculateTotals(updatedForm)
    setFormData(updatedForm)
  }

  const calculateTotals = (data) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.total || 0), 0)
    let discountAmount = 0
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * data.discount) / 100
    } else {
      discountAmount = data.discount
    }
    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * data.taxRate) / 100
    const total = afterDiscount + taxAmount

    setFormData({
      ...data,
      subtotal,
      total,
      tax: taxAmount
    })
  }

  const handleDiscountChange = (value) => {
    const updatedForm = { ...formData, discount: value }
    calculateTotals(updatedForm)
  }

  const handleTaxRateChange = (value) => {
    const updatedForm = { ...formData, taxRate: value }
    calculateTotals(updatedForm)
  }

  const handleSaveInvoice = () => {
    if (!formData.patientName || formData.items.length === 0) {
      toast.error('الرجاء إدخال بيانات المريض وإضافة عنصر واحد على الأقل')
      return
    }

    const newInvoice = {
      id: selectedInvoice?.id || Date.now(),
      ...formData,
      createdAt: selectedInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    let updatedInvoices
    if (selectedInvoice) {
      updatedInvoices = invoices.map(i => i.id === selectedInvoice.id ? newInvoice : i)
    } else {
      updatedInvoices = [newInvoice, ...invoices]
    }

    saveInvoices(updatedInvoices)
    setShowInvoiceModal(false)
    resetForm()
    toast.success(selectedInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم إضافة الفاتورة بنجاح')
  }

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setFormData({ ...invoice })
    setShowInvoiceModal(true)
  }

  const handleDeleteInvoice = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      const updated = invoices.filter(i => i.id !== id)
      saveInvoices(updated)
      toast.success('تم حذف الفاتورة بنجاح')
    }
  }

  const handleMarkAsPaid = (id) => {
    const updated = invoices.map(i => 
      i.id === id ? { ...i, paymentStatus: 'paid', paidAmount: i.total } : i
    )
    saveInvoices(updated)
    toast.success('تم تحديث حالة الدفع إلى مدفوع')
  }

  const resetForm = () => {
    setSelectedInvoice(null)
    setFormData({
      patientId: '',
      patientName: '',
      patientAge: '',
      patientPhone: '',
      invoiceNumber: `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      procedureType: 'surgery',
      procedureName: '',
      procedureDescription: '',
      diagnosis: '',
      doctorName: '',
      anesthesia: '',
      roomType: 'normal',
      surgeryDate: '',
      surgeryTime: '',
      hospitalName: '',
      items: [
        { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
      ],
      subtotal: 0,
      discount: 0,
      discountType: 'percentage',
      tax: 0,
      taxRate: 15,
      total: 0,
      paidAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      notes: ''
    })
  }

  const handlePrint = (invoice) => {
    setSelectedInvoice(invoice)
    setShowPrintPreview(true)
    setTimeout(() => {
      window.print()
      setShowPrintPreview(false)
    }, 100)
  }

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">مدفوع</span>
    }
    return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">غير مدفوع</span>
  }

  const getProcedureTypeText = (type) => {
    const types = {
      surgery: 'عملية جراحية',
      consultation: 'استشارة طبية',
      examination: 'كشف طبي',
      treatment: 'علاج',
      lab: 'تحليل معملي',
      radiology: 'أشعة'
    }
    return types[type] || type
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">جاري التحميل...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold gradient-text">الفواتير الطبية</h1>
          <p className="text-gray-400 mt-1">إدارة الفواتير وكشوف العمليات</p>
        </div>
        <button onClick={() => { resetForm(); setShowInvoiceModal(true); }} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-500/30">
          <Plus size={18} /> فاتورة جديدة
        </button>
      </div>

      {/* قائمة الفواتير */}
      <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">قائمة الفواتير</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80">
              <tr className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-6 py-3 text-sm text-gray-300">رقم الفاتورة</th>
                <th className="px-6 py-3 text-sm text-gray-300">المريض</th>
                <th className="px-6 py-3 text-sm text-gray-300">التاريخ</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإجمالي</th>
                <th className="px-6 py-3 text-sm text-gray-300">الحالة</th>
                <th className="px-6 py-3 text-sm text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">لا توجد فواتير</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-blue-400 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4"><div className="font-semibold text-white">{inv.patientName}</div><div className="text-sm text-gray-400">{inv.patientAge} سنة</div></td>
                    <td className="px-6 py-4 text-gray-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-green-400">{inv.total.toFixed(2)} ر.س</td>
                    <td className="px-6 py-4">{getPaymentStatusBadge(inv.paymentStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditInvoice(inv)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit size={16} /></button>
                        <button onClick={() => handlePrint(inv)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Printer size={16} /></button>
                        <button onClick={() => handleMarkAsPaid(inv.id)} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"><CheckCircle size={16} /></button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Modal إضافة/تعديل فاتورة - مبسط */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedInvoice ? 'تعديل فاتورة' : 'فاتورة جديدة'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-gray-700 rounded"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">اسم المريض</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientName} onChange={(e) => setFormData({...formData, patientName: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">العمر</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.patientAge} onChange={(e) => setFormData({...formData, patientAge: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">تاريخ العملية</label><input type="date" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.surgeryDate} onChange={(e) => setFormData({...formData, surgeryDate: e.target.value})} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">اسم الطبيب</label><input type="text" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.doctorName} onChange={(e) => setFormData({...formData, doctorName: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">التشخيص</label><textarea className="w-full p-2 bg-gray-700 rounded-lg text-white" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} /></div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2"><h3 className="text-white font-bold">الخدمات</h3><button onClick={handleAddItem} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm"><Plus size={14} /> إضافة</button></div>
              {formData.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                  <input type="text" className="col-span-5 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الخدمة" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                  <input type="number" className="col-span-2 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="الكمية" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                  <input type="number" className="col-span-3 p-2 bg-gray-700 rounded-lg text-white text-sm" placeholder="السعر" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  <div className="col-span-1 text-white text-sm">{item.total.toFixed(2)}</div>
                  <button onClick={() => handleRemoveItem(item.id)} className="col-span-1 text-red-400"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm text-gray-400 mb-1">الخصم (%)</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.discount} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} /></div>
              <div><label className="block text-sm text-gray-400 mb-1">الضريبة (%)</label><input type="number" className="w-full p-2 bg-gray-700 rounded-lg text-white" value={formData.taxRate} onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)} /></div>
            </div>

            <div className="bg-gray-700/30 p-3 rounded-lg mb-4">
              <div className="flex justify-between"><span className="text-gray-400">الإجمالي الفرعي:</span><span className="text-white">{formData.subtotal.toFixed(2)} ر.س</span></div>
              <div className="flex justify-between"><span className="text-gray-400">الضريبة:</span><span className="text-white">{formData.tax.toFixed(2)} ر.س</span></div>
              <div className="flex justify-between pt-2 border-t border-gray-600"><span className="text-lg font-bold text-white">الإجمالي:</span><span className="text-xl font-bold text-green-400">{formData.total.toFixed(2)} ر.س</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSaveInvoice} className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg hover:bg-green-500/30">حفظ الفاتورة</button>
              <button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-gray-600 text-gray-300 py-2 rounded-lg hover:bg-gray-500">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الطباعة */}
      {showPrintPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold">{currentLang === 'ar' ? clinicInfo.nameAr : clinicInfo.nameEn}</h1>
              <p>{currentLang === 'ar' ? clinicInfo.addressAr : clinicInfo.addressEn}</p>
              <p>هاتف: {clinicInfo.phone}</p>
            </div>
            <div className="text-center mb-6"><h2 className="text-xl font-bold">فاتورة طبية</h2><p>رقم: {selectedInvoice.invoiceNumber}</p></div>
            <div className="grid grid-cols-2 gap-4 mb-6 border p-3 rounded"><div><p className="font-bold">المريض: {selectedInvoice.patientName}</p><p>العمر: {selectedInvoice.patientAge} سنة</p></div><div><p>التاريخ: {selectedInvoice.invoiceDate}</p><p>الطبيب: {selectedInvoice.doctorName || 'غير محدد'}</p></div></div>
            <div className="mb-6 border p-3 rounded"><p className="font-bold">التشخيص:</p><p>{selectedInvoice.diagnosis}</p></div>
            <table className="w-full border-collapse mb-6"><thead className="bg-gray-100"><tr><th className="border p-2">الخدمة</th><th className="border p-2">الكمية</th><th className="border p-2">السعر</th><th className="border p-2">الإجمالي</th></tr></thead><tbody>{selectedInvoice.items.map((item, idx) => (<tr key={idx}><td className="border p-2">{item.description}</td><td className="border p-2 text-center">{item.quantity}</td><td className="border p-2">{item.unitPrice}</td><td className="border p-2">{item.total}</td></tr>))}</tbody><tfoot><tr><td colSpan="3" className="border p-2 text-right">الإجمالي</td><td className="border p-2">{selectedInvoice.total.toFixed(2)} ر.س</td></tr></tfoot></table>
            <div className="text-center pt-8 border-t"><p>شكراً لثقتكم بنا</p></div>
          </div>
          <div className="flex justify-center gap-4 mt-8 pb-8">
            <button onClick={() => window.print()} className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"><Printer size={18} /> طباعة</button>
            <button onClick={() => setShowPrintPreview(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  )
}
