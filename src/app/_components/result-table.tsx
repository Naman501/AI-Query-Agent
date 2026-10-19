"use client";

type Cell = string | number | boolean | null | undefined;

/**
 * libsql returns `{ columns, rows, rowsAffected }` where a row may serialize as
 * an array or as a keyed object, so normalise both shapes into columns + rows.
 */
export function normaliseResult(output: unknown): {
  columns: string[];
  rows: Cell[][];
} | null {
  if (!output || typeof output !== "object") return null;

  const raw = output as Record<string, unknown>;
  const rows = Array.isArray(raw.rows)
    ? raw.rows
    : Array.isArray(output)
      ? (output as unknown[])
      : null;

  if (!rows) return null;

  let columns = Array.isArray(raw.columns)
    ? (raw.columns as string[]).map(String)
    : [];

  if (!columns.length) {
    const first = rows.find((row) => row && typeof row === "object");
    if (!first || Array.isArray(first)) return null;
    columns = Object.keys(first as object).filter((key) => !/^\d+$/.test(key));
  }

  if (!columns.length) return null;

  const body = rows.map((row) =>
    columns.map((column, index) => {
      if (Array.isArray(row)) return row[index] as Cell;
      if (row && typeof row === "object") {
        const record = row as Record<string, Cell>;
        return record[column] ?? record[index];
      }
      return row as Cell;
    }),
  );

  return { columns, rows: body };
}

function format(value: Cell) {
  if (value === null || value === undefined) {
    return <span className="text-muted italic">null</span>;
  }
  if (typeof value === "number") {
    return (
      <span className="font-mono tabular-nums">
        {Number.isInteger(value) ? value : value.toFixed(2)}
      </span>
    );
  }
  if (typeof value === "boolean") return String(value);
  return String(value);
}

export function ResultTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Cell[][];
}) {
  if (!rows.length) {
    return (
      <p className="text-muted px-4 py-6 text-center text-xs">
        Query ran successfully — no rows returned.
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-auto">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-background/80 sticky top-0 backdrop-blur">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-line text-muted border-b px-3 py-2 font-semibold whitespace-nowrap uppercase tracking-wide"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-line/60 hover:bg-accent-soft/60 border-b transition-colors last:border-0"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 py-2 align-top whitespace-nowrap"
                >
                  {format(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
