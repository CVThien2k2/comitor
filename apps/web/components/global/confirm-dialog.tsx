'use client';

import * as React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@workspace/ui/components/sheet';
import { cn } from '@workspace/ui/lib/utils';
import { Icons } from './icons';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';


// Hook để quản lý dialog state
export function useDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

// Types cho các props
interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  isLoading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

// Size variants
const sizeVariants = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

// Enhanced Dialog Component
export function CustomPopup({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  isLoading = false,
  loadingText = 'Đang tải dữ liệu',
  children,
}: BaseDialogProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Mobile (< md): Bottom Sheet, Desktop (>= md): Dialog
  if (isMobile) {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={open => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="right"
          className={cn('w-full max-w-md p-4', className)}
          onPointerDownOutside={
            isLoading || !closeOnOverlayClick
              ? e => e.preventDefault()
              : undefined
          }
          onEscapeKeyDown={e => {
            if (isLoading) {
              e.preventDefault();
              return;
            }
            onClose();
          }}
          aria-busy={isLoading}
        >
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
          )}

          <div className="mt-2">{children}</div>

          {isLoading && (
            <div className="fixed inset-0 z-1000 flex items-center justify-center rounded-md backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 rounded-md px-3 py-2">
                <Icons.loader2 className="text-primary h-10 w-10 animate-spin" />
                <span className="text-sm">
                  {loadingText ?? 'Đang tải dữ liệu'}
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog
      aria-describedby={description}
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(sizeVariants[size], className)}
        showCloseButton={showCloseButton}
        onPointerDownOutside={
          isLoading || !closeOnOverlayClick
            ? e => e.preventDefault()
            : undefined
        }
        onEscapeKeyDown={e => {
          if (isLoading) {
            e.preventDefault();
            return;
          }
          onClose();
        }}
        aria-describedby={description}
        aria-busy={isLoading}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="mt-4">{children}</div>

        {isLoading && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center rounded-md backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 rounded-md px-3 py-2">
              <Icons.loader2 className="text-primary h-10 w-10 animate-spin" />
              <span className="text-sm">
                {loadingText ?? 'Đang tải dữ liệu'}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Confirm Dialog Variant
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  variant = 'info',
  size = 'sm',
  isLoading = false,
  loadingText = 'Đang tải dữ liệu',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantConfig = {
    info: {
      Icon: Info,
      iconClassName: 'text-blue-600 dark:text-blue-400',
      confirmVariant: 'default' as const,
      confirmClassName:
        'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    },
    success: {
      Icon: CheckCircle2,
      iconClassName: 'text-green-600 dark:text-green-400',
      confirmVariant: 'default' as const,
      confirmClassName:
        'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white',
    },
    warning: {
      Icon: AlertTriangle,
      iconClassName: 'text-amber-600 dark:text-amber-400',
      confirmVariant: 'default' as const,
      confirmClassName:
        'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white',
    },
    danger: {
      Icon: AlertOctagon,
      iconClassName: 'text-red-600 dark:text-red-400',
      confirmVariant: 'destructive' as const,
      confirmClassName: undefined,
    },
  } as const;

  const { Icon, iconClassName, confirmVariant, confirmClassName } =
    variantConfig[variant];

  return (
    <CustomPopup
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={true}
      closeOnOverlayClick={false}
      isLoading={isLoading}
      loadingText={loadingText}
    >
      <div className="space-y-4">
        <div
          className={cn(
            'flex items-start gap-3 rounded-md border p-3',
            variant === 'info' &&
              'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200',
            variant === 'success' &&
              'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200',
            variant === 'warning' &&
              'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
            variant === 'danger' &&
              'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200'
          )}
        >
          <Icon className={cn('mt-0.5 h-5 w-5', iconClassName)} />
          <p className="text-sm leading-6">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            className={confirmClassName}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </CustomPopup>
  );
}
