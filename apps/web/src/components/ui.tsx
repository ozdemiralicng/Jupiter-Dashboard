import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50', className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary', className)} {...props} />;
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('rounded-lg border border-border bg-background p-5 shadow-sm', className)}>{children}</section>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn('inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium', className)}>{children}</span>;
}
