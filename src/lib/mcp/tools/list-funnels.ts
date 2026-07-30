import { defineTool } from "@lovable.dev/mcp-js";
import { ownerError, errorResult, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_funnels",
  title: "List funnels",
  description: "List all conversion funnels saved by the owner.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const denied = ownerError(ctx);
    if (denied) return errorResult(denied);

    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .select("id,title,description,updated_at,created_at")
      .order("updated_at", { ascending: false });

    if (error) return errorResult(error.message);

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { funnels: data ?? [] },
    };
  },
});
