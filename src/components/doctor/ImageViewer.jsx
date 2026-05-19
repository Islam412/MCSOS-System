import { useState } from 'react'
import { X, ZoomIn, ZoomOut, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageViewer({ images, onDelete, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  
  const currentImage = images[currentIndex]
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setZoom(1)
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setZoom(1)
  }
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.data
    link.download = currentImage.fileName
    link.click()
    toast.success('جاري تحميل الصورة...')
  }
  
  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      onDelete(currentImage.id)
      if (images.length === 1) {
        onClose()
      } else if (currentIndex === images.length - 1) {
        setCurrentIndex(currentIndex - 1)
      }
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition">
        <X size={24} />
      </button>
      
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={handleDownload} className="p-2 text-white hover:bg-white/10 rounded-full transition">
          <Download size={20} />
        </button>
        <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition">
          <Trash2 size={20} />
        </button>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 rounded-full px-4 py-2">
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 text-white hover:bg-white/10 rounded-full transition">
          <ZoomOut size={20} />
        </button>
        <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 text-white hover:bg-white/10 rounded-full transition">
          <ZoomIn size={20} />
        </button>
      </div>
      
      {images.length > 1 && (
        <>
          <button onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <ChevronLeft size={32} />
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <ChevronRight size={32} />
          </button>
        </>
      )}
      
      <div className="text-center text-white text-sm absolute bottom-4 left-1/2 -translate-x-1/2 mt-12">
        {currentIndex + 1} / {images.length} - {currentImage.title}
      </div>
      
      <img 
        src={currentImage.data} 
        alt={currentImage.title}
        className="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      />
    </div>
  )
}
