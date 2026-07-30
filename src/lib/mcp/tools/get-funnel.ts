import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ownerError, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_funnel",
  title: "Get funnel",
  description: "Fetch a single funnel by id, including its nodes and edges.",
  inputSchema: { id: z.string().describe("Funnel UUID") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const denied = ownerError(ctx);
    if (denied) return errorResult(denied);

    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Not found");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { funnel: data },
    };
  },
});
