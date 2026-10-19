import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  tool,
  isStepCount,
} from "ai";
import { databaseSchema } from "./details";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { db } from "@/db/db";
const model = openai("gpt-4o-mini");
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const SYSTEM_PROMPT = `You are an expert SQL assistant that helps users to query their database using natural language.
  
${new Date().toLocaleString("sv-SE")}

You have access to following tools:
1. db tool - call this tool to query the database.
2. schema tool - call this tool to get the database schema which will help you to write sql queries.
Rules:
-Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
-Pass in valid sql syntax in db tool
-Always use schema provided by the schema tool.
-IMPORTANT : to query database call sb tool , Don't just return SQL query.

Always respond in a helpful, conversational tone while being technically accurate. `;

  const result = streamText({
    model: model,
    messages: await convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    stopWhen: isStepCount(5),
    tools: {
      db: tool({
        description: "Call this tool to query the database",
        inputSchema: z.object({
          query: z.string().describe("The SQL query to be ran"),
        }),
        execute: async ({ query }) => {
          console.log("Query:", query);
          return await db.run(query);
        },
      }),
      schema: tool({
        description: "Call this tool to get database schema information",
        inputSchema: z.object({}),
        execute: async () => {
          return databaseSchema;
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
