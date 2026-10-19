"use client";

import { useState } from "react";
import { ResultTable, normaliseResult } from "./result-table";

type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | (string & {});

export type ToolPart = {
  type: string;
  state?: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const LABELS: Record<string, { title: string; icon: string }> = {
  "tool-db": { title: "SQL query", icon: "⚡" },
  "tool-schema": { title: "Database schema", icon: "🗂" },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="text-muted hover:text-foreground hover:border-muted border-line rounded-md border px-2 py-0.5 text-[11px] transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function ToolCard({ part }: { part: ToolPart }) {
  const meta = LABELS[part.type] ?? { title: part.type, icon: "🛠" };
  const isDb = part.type === "tool-db";
  const query =
    isDb && part.input && typeof part.input === "object"
      ? String((part.input as { query?: string }).query ?? "")
      : "";

  const running =
    part.state === "input-streaming" || part.state === "input-available";
  const failed = part.state === "output-error";
  const table = part.state === "output-available" ? normaliseResult(part.output) : null;

  const [open, setOpen] = useState(isDb);

  return (
    <div className="border-line bg-background/60 overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-accent-soft/50 flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
      >
        <span aria-hidden className="text-xs">
          {meta.icon}
        </span>
        <span className="text-xs font-medium">{meta.title}</span>
        {running && (
          <span className="text-accent text-[11px]">running…</span>
        )}
        {failed && <span className="text-[11px] text-red-500">failed</span>}
        {table && (
          <span className="text-muted text-[11px]">
            {table.rows.length} {table.rows.length === 1 ? "row" : "rows"}
          </span>
        )}
        <span className="text-muted ml-auto text-[11px]">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="border-line border-t">
          {query && (
            <div className="border-line/70 flex items-start gap-2 border-b px-3 py-2">
              <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap flex-1 overflow-x-auto">
                {query}
              </pre>
              <CopyButton value={query} />
            </div>
          )}

          {failed && (
            <p className="px-3 py-2 text-[11px] text-red-500">
              {part.errorText ?? "The tool call failed."}
            </p>
          )}

          {part.state === "output-available" &&
            (table ? (
              <ResultTable columns={table.columns} rows={table.rows} />
            ) : (
              <pre className="text-muted max-h-72 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {typeof part.output === "string"
                  ? part.output.trim()
                  : JSON.stringify(part.output, null, 2)}
              </pre>
            ))}

          {running && (
            <p className="text-muted px-3 py-2 text-[11px]">
              Waiting for the database…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
