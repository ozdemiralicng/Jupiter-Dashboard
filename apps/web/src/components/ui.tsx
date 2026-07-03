import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary/90',
  secondary: 'bg-muted text-foreground hover:bg-muted/80',
  ghost: 'bg-transparent text-foreground shadow-none hover:bg-muted',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3' : 'h-10 px-4',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20', className)} {...props} />;
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('min-w-0 rounded-lg border border-border bg-background p-5 shadow-sm shadow-slate-950/5', className)}>{children}</section>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn('inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium', className)}>{children}</span>;
}

export function Alert({ tone, children }: PropsWithChildren<{ tone: 'error' | 'success' | 'warning' | 'info' }>) {
  const classes = {
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
  }[tone];
  return <div className={cn('rounded-md border px-3 py-2 text-sm', classes)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ text, className }: { text: string; className?: string }) {
  return <div className={cn('grid min-h-40 place-items-center rounded-md border border-dashed border-border px-6 py-10 text-center text-sm text-foreground/60', className)}>{text}</div>;
}
