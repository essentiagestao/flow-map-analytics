import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listFunnelsTool from "./tools/list-funnels";
import getFunnelTool from "./tools/get-funnel";
import listNodeTypesTool from "./tools/list-node-types";
import createFunnelTool from "./tools/create-funnel";
import updateFunnelTool from "./tools/update-funnel";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "flow-map-mcp",
  title: "Flow Map MCP",
  version: "0.2.0",
  instructions:
    "Tools for the Flow Map conversion-funnel editor. Use list_node_types to discover every available palette item (traffic sources, pages, communication, events) and their ids, then create_funnel to build a funnel from nodes and connections. Use list_funnels/get_funnel to inspect existing funnels and update_funnel to change one. Access is restricted to the app owner.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listNodeTypesTool, listFunnelsTool, getFunnelTool, createFunnelTool, updateFunnelTool],
});
