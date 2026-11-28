import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard data">
      <div className="h-14 w-full animate-pulse rounded-lg bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-7 w-14 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white lg:col-span-8" />
        <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white lg:col-span-4" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e2e7df] bg-white px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4dbd0] bg-[#f4f6f3] text-[#163300]">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-display text-sm font-bold text-[#163300]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#5c6b54]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-full bg-[#9FE870] px-4 py-2 text-sm font-semibold text-[#163300] transition-colors hover:bg-[#8cd95c]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 px-6 py-12 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-display text-sm font-bold text-[#163300]">Unable to load data</h3>
      <p className="mt-1 max-w-md text-sm text-[#45553d]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#163300] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#234d00]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

