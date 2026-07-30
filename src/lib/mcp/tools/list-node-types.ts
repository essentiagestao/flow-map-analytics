import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { allNodeTypes, categoryLabels } from "../../../components/Editor/nodes/nodeTypes";
import {
  trafficDefaults,
  pageDefaults,
  communicationDefaults,
  eventDefaults,
} from "../../utils/defaultMetrics";
import { ownerError, errorResult } from "../supabase";

const defaultsByCategory: Record<string, Record<string, unknown>> = {
  traffic: trafficDefaults,
  page: pageDefaults,
  communication: communicationDefaults,
  event: eventDefaults,
};

export default defineTool({
  name: "list_node_types",
  title: "List node types",
  description:
    "List every item available in the funnel palette (traffic sources, pages, communication and events) with its id, category, label and default metrics. Use these ids as `type` when calling create_funnel or update_funnel.",
  inputSchema: {
    category: z
      .enum(["traffic", "page", "communication", "event"])
      .optional()
      .describe("Optional category filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (input, ctx) => {
    const denied = ownerError(ctx);
    if (denied) return errorResult(denied);

    const items = allNodeTypes
      .filter((n) => !input.category || n.category === input.category)
      .map((n) => ({
        type: n.id,
        label: n.label,
        category: n.category,
        categoryLabel: categoryLabels[n.category],
        description: n.description,
        defaultMetrics: defaultsByCategory[n.category]?.[n.id] ?? {},
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { nodeTypes: items },
    };
  },
});
