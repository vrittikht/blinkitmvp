"use client";

import { useEffect, useState } from "react";

import { fetchHealth, getApiBaseUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status = "loading" | "ok" | "error";

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [detail, setDetail] = useState("Checking API…");

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (cancelled) return;
        setStatus("ok");
        setDetail(`${data.service} · ${data.status}`);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setDetail("API unreachable — start the FastAPI server on :8000");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Backend health</h2>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            status === "loading" && "bg-secondary text-muted-foreground",
            status === "ok" && "bg-primary/10 text-primary",
            status === "error" && "bg-destructive/10 text-destructive",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "loading" && "animate-pulse bg-muted-foreground",
              status === "ok" && "bg-primary",
              status === "error" && "bg-destructive",
            )}
          />
          {status === "loading" ? "…" : status === "ok" ? "Connected" : "Offline"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      <p className="mt-3 font-mono text-[11px] break-all text-muted-foreground/80">
        {getApiBaseUrl()}/health
      </p>
    </section>
  );
}
