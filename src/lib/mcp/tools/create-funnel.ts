import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ownerError, errorResult, supabaseForUser } from "../supabase";
import { buildCanvas, nodeInputSchema, connectionInputSchema } from "../funnelBuilder";

export default defineTool({
  name: "create_funnel",
  title: "Create funnel",
  description:
    "Create a new conversion funnel with its nodes and connections. Use list_node_types first to pick valid node type ids.",
  inputSchema: {
    title: z.string().describe("Funnel title."),
    description: z.string().optional(),
    nodes: z.array(nodeInputSchema).describe("Funnel steps."),
    connections: z
      .array(connectionInputSchema)
      .optional()
      .describe("Connections between the node keys."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, description, nodes, connections }, ctx) => {
    const denied = ownerError(ctx);
    if (denied) return errorResult(denied);

    const built = buildCanvas(nodes, connections ?? []);
    if ("error" in built) return errorResult(built.error);

    const { data, error } = await supabaseForUser(ctx)
      .from("funnels")
      .insert({
        user_id: ctx.getUserId(),
        title,
        description: description ?? null,
        canvas_data: built.canvas as never,
      })
      .select("id,title,description,created_at,updated_at")
      .single();

    if (error) return errorResult(error.message);

    return {
      content: [
        {
          type: "text",
          text: `Funil "${data.title}" criado com ${built.canvas.nodes.length} nós e ${built.canvas.edges.length} conexões (id ${data.id}).`,
        },
      ],
      structuredContent: { funnel: data },
    };
  },
});
