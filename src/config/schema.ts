import { z } from 'zod';

export const reviewConfigSchema = z.object({
  language: z.enum(['en', 'zh-TW', 'zh-CN', 'ja', 'ko']).default('en'),
  model: z.string().default('kimi-k2.5'),

  review: z
    .object({
      auto: z
        .object({
          enabled: z.boolean().default(true),
          onOpen: z.boolean().default(true),
          onPush: z.boolean().default(true),
          onReviewRequest: z.boolean().default(true),
          drafts: z.boolean().default(false),
        })
        .default({}),

      aspects: z
        .object({
          bugs: z.boolean().default(true),
          security: z.boolean().default(true),
          performance: z.boolean().default(true),
          style: z.boolean().default(true),
          bestPractices: z.boolean().default(true),
          documentation: z.boolean().default(false),
          testing: z.boolean().default(false),
        })
        .default({}),

      minSeverity: z
        .enum(['critical', 'warning', 'suggestion', 'nitpick'])
        .default('suggestion'),

      maxAnnotations: z.number().min(1).max(100).default(30),

      failOn: z.enum(['critical', 'warning', 'never']).default('critical'),
    })
    .default({}),

  files: z
    .object({
      include: z.array(z.string()).default(['**/*']),
      exclude: z
        .array(z.string())
        .default([
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.lock',
          '**/*.min.*',
          '**/package-lock.json',
          '**/yarn.lock',
          '**/pnpm-lock.yaml',
        ]),
      maxFileSize: z.number().default(100_000),
    })
    .default({}),

  rules: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        filePattern: z.string().optional(),
        severity: z.enum(['critical', 'warning', 'suggestion']).default('warning'),
      }),
    )
    .default([]),

  prompt: z
    .object({
      systemAppend: z.string().max(2000).optional(),
      reviewFocus: z.string().max(500).optional(),
    })
    .default({}),

  cache: z
    .object({
      enabled: z.boolean().default(true),
      ttl: z.number().default(3600),
    })
    .default({}),
});

export type ReviewConfig = z.infer<typeof reviewConfigSchema>;
