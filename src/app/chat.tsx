"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { RichText } from "./_components/rich-text";
import { ToolCard, type ToolPart } from "./_components/tool-card";

const SUGGESTIONS = [
  "What are my top 5 products by revenue?",
  "Show total sales per region this month",
  "Which products are running low on stock?",
  "Who are my highest-spending customers?",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error, regenerate } = useChat();

  const busy = status === "submitted" || status === "streaming";
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    const field = textareaRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 180)}px`;
  }, [input]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* <header className="border-line bg-panel/80 sticky top-0 z-10 border-b backdrop-blur-xl"> */}
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <div className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm">
            Q
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">QueryMind</h1>
            <p className="text-muted truncate text-xs">
              Ask your database anything, in plain English
            </p>
          </div>
          <span className="text-muted border-line ml-auto hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            SQLite · products, sales
          </span>
        </div>
      {/* </header> */}

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8">
          {messages.length === 0 ? (
            <EmptyState onPick={submit} />
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`animate-rise flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${
                      isUser
                        ? "border-line text-muted border"
                        : "bg-accent text-white"
                    }`}
                  >
                    {isUser ? "You" : "Q"}
                  </div>

                  <div
                    className={`flex min-w-0 flex-col gap-2 text-sm ${
                      isUser
                        ? "bg-accent max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-white shadow-sm"
                        : "border-line bg-panel w-full rounded-2xl rounded-tl-sm border px-4 py-3 shadow-sm"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      const key = `${message.id}-${index}`;

                      if (part.type === "text") {
                        return <RichText key={key} text={part.text} />;
                      }

                      if (part.type.startsWith("tool-")) {
                        return <ToolCard key={key} part={part as ToolPart} />;
                      }

                      if (part.type === "reasoning" && "text" in part) {
                        return (
                          <p
                            key={key}
                            className="text-muted text-xs italic leading-relaxed"
                          >
                            {String(part.text)}
                          </p>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            })
          )}

          {busy && <Thinking />}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-500">
              <span className="flex-1">
                Something went wrong: {error.message || "request failed"}
              </span>
              <button
                type="button"
                onClick={() => regenerate()}
                className="rounded-md border border-red-500/40 px-2 py-1 font-medium transition-colors hover:bg-red-500/10"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-line bg-panel/80 border-t backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit(input);
            }}
            className="border-line bg-background focus-within:border-accent focus-within:ring-accent/20 flex items-end gap-2 rounded-2xl border p-2 shadow-sm transition focus-within:ring-4"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="Which region sold the most last quarter?"
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(input);
                }
              }}
              className="placeholder:text-muted max-h-44 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            />

            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="border-line hover:bg-accent-soft flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
                aria-label="Stop generating"
              >
                <span className="bg-foreground size-2.5 rounded-sm" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </form>

          <p className="text-muted mt-2 text-center text-[11px]">
            Read-only access, QueryMind only runs SELECT queries.
            <span className="hidden sm:inline">
              {" "}
              Press Enter to send, Shift + Enter for a new line.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="animate-rise flex flex-col items-center gap-6 py-10 text-center">
      <div className="bg-accent flex size-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg">
        Q
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">What do you want to know?</h2>
        <p className="text-muted mx-auto max-w-sm text-sm leading-relaxed">
          Describe it in plain English. QueryMind inspects your schema, writes
          the SQL, runs it, and explains what came back.
        </p>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className="border-line bg-panel hover:border-accent hover:bg-accent-soft rounded-xl border px-3.5 py-3 text-left text-xs leading-relaxed shadow-sm transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="text-muted flex items-center gap-3 text-xs">
      <div className="bg-accent flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white">
        Q
      </div>
      <span className="flex items-center gap-1">
        Thinking
        <span className="dot bg-muted ml-0.5 size-1 rounded-full" />
        <span
          className="dot bg-muted size-1 rounded-full"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="dot bg-muted size-1 rounded-full"
          style={{ animationDelay: "0.4s" }}
        />
      </span>
    </div>
  );
}
