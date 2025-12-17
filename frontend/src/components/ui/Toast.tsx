import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string) => addToast('success', message), [addToast]);
    const error = useCallback((message: string) => addToast('error', message, 6000), [addToast]);
    const info = useCallback((message: string) => addToast('info', message), [addToast]);
    const warning = useCallback((message: string) => addToast('warning', message, 5000), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(onClose, 300);
    };

    const config = {
        success: {
            icon: CheckCircle,
            bg: 'bg-green-500/20',
            border: 'border-green-500/50',
            iconColor: 'text-green-400',
            glow: 'shadow-green-500/20',
        },
        error: {
            icon: AlertCircle,
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            iconColor: 'text-red-400',
            glow: 'shadow-red-500/20',
        },
        info: {
            icon: Info,
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            iconColor: 'text-blue-400',
            glow: 'shadow-blue-500/20',
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/50',
            iconColor: 'text-yellow-400',
            glow: 'shadow-yellow-500/20',
        },
    };

    const { icon: Icon, bg, border, iconColor, glow } = config[toast.type];

    return (
        <div
            className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
        backdrop-blur-xl ${bg} border ${border}
        shadow-lg ${glow}
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        min-w-[280px] max-w-[400px]
      `}
        >
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
            <p className="text-white text-sm flex-1">{toast.message}</p>
            <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
        </div>
    );
}

export { ToastContext };
