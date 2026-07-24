import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

declare const process: { env: Record<string, string | undefined> };

const OWNER_EMAIL = "estevaopbxs@gmail.com";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_funnel",
  title: "Get funnel",
  description: "Fetch a single funnel by id, including its nodes and edges.",
  inputSchema: { id: z.string().describe("Funnel UUID") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated() || (ctx.getUserEmail() ?? "").toLowerCase() !== OWNER_EMAIL) {
      return { content: [{ type: "text", text: "Not authorized" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { funnel: data },
    };
  },
});
