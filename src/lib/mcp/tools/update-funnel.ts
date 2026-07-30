import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ownerError, errorResult, supabaseForUser } from "../supabase";
import { buildCanvas, nodeInputSchema, connectionInputSchema } from "../funnelBuilder";

export default defineTool({
  name: "update_funnel",
  title: "Update funnel",
  description:
    "Update an existing funnel: rename it and/or replace its nodes and connections. Passing nodes rebuilds the whole canvas.",
  inputSchema: {
    id: z.string().describe("Funnel UUID."),
    title: z.string().optional(),
    description: z.string().optional(),
    nodes: z.array(nodeInputSchema).optional().describe("New full set of funnel steps."),
    connections: z.array(connectionInputSchema).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id, title, description, nodes, connections }, ctx) => {
    const denied = ownerError(ctx);
    if (denied) return errorResult(denied);

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    if (nodes) {
      const built = buildCanvas(nodes, connections ?? []);
      if ("error" in built) return errorResult(built.error);
      updates.canvas_data = built.canvas;
    } else if (connections) {
      return errorResult("Connections can only be updated together with nodes.");
    }

    if (Object.keys(updates).length === 1) {
      return errorResult("Nothing to update.");
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .update(updates as never)
      .eq("id", id)
      .select("id,title,description,updated_at")
      .maybeSingle();

    if (error) return errorResult(error.message);
    if (!data) return errorResult("Funnel not found.");

    return {
      content: [{ type: "text", text: `Funil "${data.title}" atualizado.` }],
      structuredContent: { funnel: data },
    };
  },
});
