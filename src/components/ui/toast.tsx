import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toastListeners: ((toast: Toast) => void)[] = []

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const toast: Toast = { id: crypto.randomUUID(), message, type }
  toastListeners.forEach(fn => fn(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 2500)
  }, [])

  useEffect(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== addToast)
    }
  }, [addToast])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[400px]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-card-hover animate-slide-down",
            "bg-card border border-border",
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-success shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-primary shrink-0" />}
          <span className="text-sm text-foreground flex-1">{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
