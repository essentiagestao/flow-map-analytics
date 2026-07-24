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

function assertOwner(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return { ok: false, msg: "Not authenticated" };
  const email = (ctx.getUserEmail() ?? "").toLowerCase();
  if (email !== OWNER_EMAIL) return { ok: false, msg: "Not authorized" };
  return { ok: true as const };
}

export default defineTool({
  name: "list_funnels",
  title: "List funnels",
  description: "List all conversion funnels saved by the owner.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const guard = assertOwner(ctx);
    if (!guard.ok) return { content: [{ type: "text", text: guard.msg }], isError: true };

    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .select("id,title,description,updated_at,created_at")
      .order("updated_at", { ascending: false });

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { funnels: data ?? [] },
    };
  },
});
