import { Toast as ToastPrimitive } from "~/components/types/types"

export interface ToastProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export type Toast = ToastProps;