import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  tool,
} from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
const model = openai("gpt-4o-mini");
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const SYSTEM_PROMPT = `You are an expert SQL assistant that helps users to query their database using natural language.
You have access to following tools:
1. db tool - call this tool to query the database.

Rules:
-Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
-Return valid SQLite syntax

Always respond in a helpful, conversational tone while being technically accurate. `;

  const result = streamText({
    model: model,
    messages: await convertToModelMessages(messages),
    system:SYSTEM_PROMPT,
    tools: {
      db: tool({
        description: "Call this tool to query the database",
        inputSchema: z.object({
          query: z.string().describe("The SQL query to be ran"),
        }),
        execute: async ({ query }) => {
          console.log("Query:", query);
          return query;
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
