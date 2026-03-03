import { z } from 'zod';
import type { ReviewResult, Severity, AnnotationCategory } from '../types/review.js';
import { logger } from '../utils/logger.js';

// Accept both camelCase and snake_case field names
const annotationSchema = z
  .object({
    path: z.string(),
    startLine: z.number().int().positive().optional(),
    start_line: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
    end_line: z.number().int().positive().optional(),
    line: z.number().int().positive().optional(),
    severity: z.enum(['critical', 'warning', 'suggestion', 'nitpick']),
    category: z
      .enum([
        'bug', 'security', 'performance', 'style',
        'best-practice', 'documentation', 'testing', 'other',
      ])
      .catch('other'),
    title: z.string(),
    body: z.string().optional().default(''),
    message: z.string().optional(),
    description: z.string().optional(),
    suggestedFix: z.string().nullable().optional(),
    suggested_fix: z.string().nullable().optional(),
  })
  .transform((a) => {
    const startLine = a.startLine ?? a.start_line ?? a.line ?? 1;
    const endLine = a.endLine ?? a.end_line ?? startLine;
    const body = a.body || a.message || a.description || '';
    const suggestedFix = a.suggestedFix ?? a.suggested_fix ?? undefined;
    return {
      path: a.path,
      startLine,
      endLine,
      severity: a.severity,
      category: a.category as AnnotationCategory,
      title: a.title,
      body,
      suggestedFix: suggestedFix ?? undefined,
    };
  });

const reviewResponseSchema = z.object({
  summary: z.string(),
  score: z.number().min(0).max(100),
  annotations: z.array(annotationSchema).default([]),
});

/**
 * Try multiple strategies to extract a JSON object from Kimi's response.
 */
function extractJson(raw: string): unknown | null {
  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(raw);
  } catch { /* continue */ }

  // Strategy 2: Extract from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch { /* continue */ }
  }

  // Strategy 3: Find the outermost JSON object { ... } in the text
  const firstBrace = raw.indexOf('{');
  if (firstBrace >= 0) {
    // Find the matching closing brace by tracking depth
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = firstBrace; i < raw.length; i++) {
      const ch = raw[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(raw.slice(firstBrace, i + 1));
          } catch { /* continue */ }
          break;
        }
      }
    }
  }

  return null;
}

export function parseKimiResponse(
  raw: string,
  tokenUsage: { input: number; output: number; cached: number },
): ReviewResult {
  logger.info({ rawLength: raw.length, rawPreview: raw.slice(0, 300) }, 'Parsing Kimi response');

  const parsed = extractJson(raw);

  if (!parsed || typeof parsed !== 'object') {
    logger.error({ rawPreview: raw.slice(0, 500) }, 'Could not extract JSON from Kimi response');
    return {
      summary: 'Failed to parse Kimi response as JSON.',
      score: 50,
      annotations: [],
      stats: { critical: 0, warning: 0, suggestion: 0, nitpick: 0 },
      tokensUsed: tokenUsage,
    };
  }

  const result = reviewResponseSchema.safeParse(parsed);
  if (result.success) {
    const data = result.data;
    const stats: Record<Severity, number> = { critical: 0, warning: 0, suggestion: 0, nitpick: 0 };
    for (const a of data.annotations) {
      stats[a.severity]++;
    }
    return {
      summary: data.summary,
      score: data.score,
      annotations: data.annotations,
      stats,
      tokensUsed: tokenUsage,
    };
  }

  // Schema validation failed — salvage what we can
  logger.warn({ errors: result.error.issues }, 'Kimi response schema validation failed, salvaging');
  const partial = parsed as Record<string, unknown>;
  const summary = typeof partial.summary === 'string' ? partial.summary : 'Review completed (partial parse)';
  const score = typeof partial.score === 'number' ? Math.min(100, Math.max(0, partial.score)) : 50;

  // Try to salvage annotations even if some are invalid
  let annotations: ReviewResult['annotations'] = [];
  if (Array.isArray(partial.annotations)) {
    for (const item of partial.annotations) {
      const parsed = annotationSchema.safeParse(item);
      if (parsed.success) {
        annotations.push(parsed.data);
      }
    }
  }

  const stats: Record<Severity, number> = { critical: 0, warning: 0, suggestion: 0, nitpick: 0 };
  for (const a of annotations) {
    stats[a.severity]++;
  }

  return { summary, score, annotations, stats, tokensUsed: tokenUsage };
}
