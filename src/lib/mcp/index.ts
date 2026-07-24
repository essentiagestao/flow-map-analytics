import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listFunnelsTool from "./tools/list-funnels";
import getFunnelTool from "./tools/get-funnel";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "flow-map-mcp",
  title: "Flow Map MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Flow Map conversion-funnel editor. Use list_funnels to list saved funnels and get_funnel to inspect one. Access is restricted to the app owner.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listFunnelsTool, getFunnelTool],
});
