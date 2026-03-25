import { z } from "zod";
import vackerProfile from "@/data/vacker-company.json";

export type ApprovalMode = "auto" | "ask" | "deny";
export type SideEffectLevel = "read" | "low" | "high";

type RuntimeTool = {
  key: string;
  label: string;
  description: string;
  schema: Record<string, unknown>;
  approvalMode: ApprovalMode;
  sideEffect: SideEffectLevel;
  readOnly: boolean;
  cardRenderer?: string | null;
  execute: (args: any) => Promise<unknown>;
};

function searchByQuery<T extends Record<string, unknown>>(rows: T[], query?: string) {
  if (!query) return rows;
  const q = query.toLowerCase();
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
}

const vackerProfileTool: RuntimeTool = {
  key: "internal.vacker_profile",
  label: "Vacker Company Profile",
  description: "Get details about Vacker Advertising in Uganda including contact and social links.",
  schema: {
    type: "object",
    properties: {
      section: {
        type: "string",
        enum: ["overview", "services", "contact", "social", "clients", "all"],
        default: "overview"
      },
      query: { type: "string", description: "Optional keyword filter" },
      limit: { type: "number", default: 10 }
    },
    additionalProperties: false
  },
  approvalMode: "auto",
  sideEffect: "read",
  readOnly: true,
  cardRenderer: "profile",
  execute: async (args) => {
    const section = String(args?.section || "overview");
    const limit = Number(args?.limit || 10);
    const query = args?.query ? String(args.query) : "";

    if (section === "services") {
      return {
        section,
        items: searchByQuery(vackerProfile.services, query).slice(0, limit)
      };
    }

    if (section === "social") {
      return {
        section,
        items: searchByQuery(vackerProfile.socialMedia, query).slice(0, limit)
      };
    }

    if (section === "clients") {
      return {
        section,
        items: searchByQuery(vackerProfile.notableClients.map((name) => ({ name })), query).slice(0, limit)
      };
    }

    if (section === "contact") {
      const contactRows = [
        { type: "address", value: vackerProfile.contact.address },
        ...vackerProfile.contact.phones.map((phone) => ({ type: "phone", value: phone })),
        { type: "email", value: vackerProfile.contact.email },
        { type: "website", value: vackerProfile.contact.website }
      ];
      return {
        section,
        items: searchByQuery(contactRows, query).slice(0, limit)
      };
    }

    if (section === "all") {
      return vackerProfile;
    }

    const overviewRows = [
      { label: "company", value: vackerProfile.companyName },
      { label: "tagline", value: vackerProfile.tagline },
      { label: "description", value: vackerProfile.description },
      { label: "founded", value: String(vackerProfile.founded) },
      { label: "headquarters", value: vackerProfile.headquarters }
    ];

    return {
      section: "overview",
      items: searchByQuery(overviewRows, query).slice(0, limit)
    };
  }
};

export async function getAllRuntimeTools(): Promise<RuntimeTool[]> {
  return [vackerProfileTool];
}

export function buildOpenAITools(runtimeTools: RuntimeTool[]) {
  return runtimeTools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.key.replace(/[^a-zA-Z0-9_]/g, "_"),
      description: `${tool.description}. Approval mode: ${tool.approvalMode}.`,
      parameters: tool.schema
    }
  }));
}

export function resolveToolByOpenAIName(runtimeTools: RuntimeTool[], fnName: string) {
  return runtimeTools.find((t) => t.key.replace(/[^a-zA-Z0-9_]/g, "_") === fnName);
}

export const finalResponseExtractionSchema = z.object({
  text: z.string(),
  cards: z.array(z.any()).default([])
});
