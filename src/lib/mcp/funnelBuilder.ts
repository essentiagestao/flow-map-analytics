import { z } from "zod";
import { allNodeTypes, type NodeCategory } from "../../components/Editor/nodes/nodeTypes";
import {
  trafficDefaults,
  pageDefaults,
  communicationDefaults,
  eventDefaults,
} from "../utils/defaultMetrics";

const defaultsByCategory: Record<NodeCategory, Record<string, Record<string, number>>> = {
  traffic: trafficDefaults as Record<string, Record<string, number>>,
  page: pageDefaults as Record<string, Record<string, number>>,
  communication: communicationDefaults as Record<string, Record<string, number>>,
  event: eventDefaults as Record<string, Record<string, number>>,
};

const defaultSizes: Record<NodeCategory, { width: number; height: number }> = {
  traffic: { width: 64, height: 64 },
  page: { width: 160, height: 140 },
  communication: { width: 56, height: 56 },
  event: { width: 56, height: 56 },
};

export const nodeInputSchema = z.object({
  key: z.string().describe("Reference used by the connections (e.g. 'fb', 'lp')."),
  type: z.string().describe("Node type id from list_node_types (e.g. 'facebook', 'landing')."),
  label: z.string().optional().describe("Custom label. Defaults to the palette label."),
  url: z.string().optional(),
  visitors: z.number().optional().describe("Traffic nodes only: number of visitors."),
  conversionRate: z.number().optional().describe("Page nodes only: conversion rate in percent."),
  utilizationRate: z
    .number()
    .optional()
    .describe("Communication/event nodes only: utilization rate in percent."),
  cost: z.number().optional(),
  x: z.number().optional().describe("Canvas X position. Auto-laid out when omitted."),
  y: z.number().optional().describe("Canvas Y position. Auto-laid out when omitted."),
});

export const connectionInputSchema = z.object({
  from: z.string().describe("Source node key."),
  to: z.string().describe("Target node key."),
  splitPercent: z
    .number()
    .optional()
    .describe("Share of the traffic sent through this path (percent). Defaults to an even split."),
  style: z.enum(["solid", "dashed"]).optional(),
  label: z.string().optional(),
});

export type NodeInput = z.infer<typeof nodeInputSchema>;
export type ConnectionInput = z.infer<typeof connectionInputSchema>;

const CATEGORY_ORDER: NodeCategory[] = ["traffic", "page", "communication", "event"];

export function buildCanvas(
  nodes: NodeInput[],
  connections: ConnectionInput[],
): { canvas: { nodes: unknown[]; edges: unknown[] } } | { error: string } {
  if (nodes.length === 0) return { error: "At least one node is required." };

  const keys = new Set<string>();
  for (const n of nodes) {
    if (keys.has(n.key)) return { error: `Duplicate node key: ${n.key}` };
    keys.add(n.key);
  }
  for (const c of connections) {
    if (!keys.has(c.from)) return { error: `Unknown connection source key: ${c.from}` };
    if (!keys.has(c.to)) return { error: `Unknown connection target key: ${c.to}` };
  }

  const stamp = Date.now();
  const idByKey = new Map<string, string>();
  const columnCount = new Map<number, number>();
  const builtNodes: unknown[] = [];

  nodes.forEach((n, index) => {
    const config = allNodeTypes.find((t) => t.id === n.type);
    if (!config) return;

    const category = config.category;
    const size = defaultSizes[category];
    const metrics = { ...(defaultsByCategory[category]?.[n.type] ?? {}) } as Record<string, number>;
    if (n.visitors !== undefined) metrics.visitors = n.visitors;
    if (n.conversionRate !== undefined) metrics.conversionRate = n.conversionRate;
    if (n.utilizationRate !== undefined) metrics.utilizationRate = n.utilizationRate;
    if (n.cost !== undefined) metrics.cost = n.cost;

    // Simple left-to-right layout grouped by category when positions are omitted.
    const column = CATEGORY_ORDER.indexOf(category);
    const row = columnCount.get(column) ?? 0;
    columnCount.set(column, row + 1);

    const id = `${n.type}-${stamp}-${index}`;
    idByKey.set(n.key, id);

    builtNodes.push({
      id,
      type: category,
      position: {
        x: n.x ?? 80 + column * 320,
        y: n.y ?? 80 + row * 200,
      },
      data: {
        label: n.label ?? config.label,
        nodeType: n.type,
        url: n.url ?? "",
        width: size.width,
        height: size.height,
        ...metrics,
      },
    });
  });

  const unknownTypes = nodes.filter((n) => !allNodeTypes.some((t) => t.id === n.type));
  if (unknownTypes.length > 0) {
    return {
      error: `Unknown node type(s): ${unknownTypes
        .map((n) => n.type)
        .join(", ")}. Call list_node_types for valid ids.`,
    };
  }

  const outgoing = new Map<string, number>();
  for (const c of connections) outgoing.set(c.from, (outgoing.get(c.from) ?? 0) + 1);

  const builtEdges = connections.map((c, index) => ({
    id: `e${idByKey.get(c.from)}-${idByKey.get(c.to)}-${stamp}-${index}`,
    source: idByKey.get(c.from),
    target: idByKey.get(c.to),
    type: "custom",
    data: {
      style: c.style ?? "solid",
      splitPercent:
        c.splitPercent ?? Math.round(100 / Math.max(1, outgoing.get(c.from) ?? 1)),
      ...(c.label ? { label: c.label } : {}),
    },
  }));

  return { canvas: { nodes: builtNodes, edges: builtEdges } };
}
