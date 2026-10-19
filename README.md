# AI Query Agent

A natural-language interface to a SQL database. Users ask questions in plain English; an LLM agent inspects the schema, writes a `SELECT` query, executes it against the database, and streams back both the result table and a conversational explanation.

## Features

- Natural-language to SQL over a live SQLite/Turso database
- Agentic tool loop: the model fetches the schema, then runs the query it generates
- Streamed responses with inline tool-call cards showing the executed SQL
- Tabular rendering of query results, with raw output available for inspection
- Read-only by design: the system prompt restricts generation to `SELECT` statements

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| AI | Vercel AI SDK 7, `@ai-sdk/openai`, `gpt-4o-mini` |
| Database | Turso (libSQL) via Drizzle ORM |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| Package manager | pnpm |

## Architecture

```
src/
  app/
    api/chat/route.ts        Streaming chat endpoint; defines the db and schema tools
    api/chat/details.ts      Schema description supplied to the model
    chat.tsx                 Chat client (useChat), input handling, suggestions
    _components/
      tool-card.tsx          Renders tool invocations and their state
      result-table.tsx       Normalises libSQL output into columns and rows
      rich-text.tsx          Minimal markdown rendering for assistant replies
  db/
    db.ts                    libSQL client and Drizzle instance
    schema.ts                Drizzle table definitions (products, sales)
    db.seed.ts               Sample data
    migrations/              Generated SQL migrations
```

The agent exposes two tools to the model:

- `schema` — returns a text description of the tables, relationships, and business rules.
- `db` — executes a SQL string against the database and returns the result set.

The loop is capped at five steps, so the model typically calls `schema`, then `db`, then summarises the result.

## Data Model

**products** — `id`, `name`, `category`, `price`, `stock`, `created_at`

**sales** — `id`, `product_id` (FK to `products.id`), `quantity`, `total_amount`, `sale_date`, `customer_name`, `region`

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 11
- A Turso database and an OpenAI API key

### Installation

```bash
pnpm install
```

### Environment

Create `.env.local` in the project root:

```
OPENAI_API_KEY=your-openai-key
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

### Database Setup

```bash
pnpm db:generate   # generate migrations from src/db/schema.ts
pnpm db:migrate    # apply migrations to the database
```

To load sample data, run `src/db/db.seed.ts` with a TypeScript runner, for example:

```bash
pnpm dlx tsx src/db/db.seed.ts
```

### Development

```bash
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm db:generate` | Generate Drizzle migrations from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Example Queries

- What are my top 5 products by revenue?
- Show total sales per region this month.
- Which products are running low on stock?
- Who are my highest-spending customers?

## Security Considerations

Query generation is constrained to `SELECT` statements by the system prompt alone. This is a prompt-level guardrail, not an enforced one — a production deployment should additionally use a read-only database credential and validate generated SQL before execution.

## License

Private.
