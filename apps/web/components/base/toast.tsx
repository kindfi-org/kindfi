import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  className?: string;
}

const Toast = React.forwardRef<HTMLLIElement, ToastProps>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${className}`}
    {...props}
  />
))
Toast.displayName = "Toast"

interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {
  className?: string;
}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive ${className}`}
    {...props}
  />
))
ToastAction.displayName = "ToastAction"

const ToastProvider = ToastPrimitives.Provider

interface Toast {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

interface UseToastReturn {
  toast: (props: Omit<Toast, "id">) => () => void;
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}

const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ title, description, action }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, title, description, action }])
    
    return () => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }
  }, [])

  return { toast, toasts, setToasts }
}

export { Toast, ToastAction, ToastProvider, useToast }
export type { Toast as ToastType }