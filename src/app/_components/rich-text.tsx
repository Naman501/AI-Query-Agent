"use client";

import { Fragment, type ReactNode } from "react";

/**
 * Minimal markdown rendering for assistant replies: fenced code blocks,
 * inline code, bold, and bullet lists. Enough for SQL answers without
 * pulling in a parser.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/```/);

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) =>
        index % 2 === 1 ? (
          <pre
            key={index}
            className="border-line bg-background overflow-x-auto rounded-lg border px-3 py-2 font-mono text-[11px] leading-relaxed"
          >
            {block.replace(/^\w*\n/, "").trimEnd()}
          </pre>
        ) : (
          <Fragment key={index}>{renderProse(block)}</Fragment>
        ),
      )}
    </div>
  );
}

function renderProse(block: string) {
  const lines = block.split("\n");

  return lines.map((line, index) => {
    if (!line.trim()) return null;

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      return (
        <div key={index} className="flex gap-2">
          <span className="text-accent select-none">•</span>
          <span>{renderInline(bullet[1])}</span>
        </div>
      );
    }

    return (
      <p key={index} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(line: string): ReactNode[] {
  return line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={index}
          className="bg-accent-soft text-accent rounded px-1 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={index} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}
