import { cn } from "@/lib/utils";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="size-8 animate-pulse rounded-full bg-primary/20" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorBlock({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-destructive">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold text-primary"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
