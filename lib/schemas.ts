import { z } from "zod";

export const providerSchema = z.object({
  label: z.string().min(1),
  baseUrl: z.string().url(),
  apiKey: z.string().optional().nullable(),
  model: z.string().min(1),
  defaultHeaders: z.record(z.string()).optional().nullable(),
  enabled: z.boolean().default(true)
});

export const chatInputSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1),
  approvalRequestId: z.string().optional(),
  approvalAction: z.enum(["approve", "reject"]).optional()
});

export const collectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
  defaultRenderer: z.string().optional().nullable()
});

export const collectionFieldSchema = z.object({
  name: z.string().min(1),
  key: z.string().regex(/^[a-zA-Z0-9_]+$/),
  type: z.string().min(1),
  required: z.boolean().default(false),
  position: z.number().int().default(0)
});

export const cardPayloadSchema = z.object({
  type: z.enum(["grid", "profile", "list", "stat", "map", "generic"]).default("generic"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(z.any()).default([]),
  detail: z.any().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string() })).optional()
});

export const assistantResponseSchema = z.object({
  text: z.string(),
  cards: z.array(cardPayloadSchema).default([]),
  toolStatus: z.array(z.string()).default([]),
  approvalRequest: z
    .object({
      id: z.string(),
      toolKey: z.string(),
      args: z.any(),
      reason: z.string().optional()
    })
    .optional()
});
