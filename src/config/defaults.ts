import type { ReviewConfig } from './schema.js';

export const DEFAULT_CONFIG: ReviewConfig = {
  language: 'en',
  model: 'kimi-k2.5',
  review: {
    auto: {
      enabled: true,
      onOpen: true,
      onPush: true,
      onReviewRequest: true,
      drafts: false,
    },
    aspects: {
      bugs: true,
      security: true,
      performance: true,
      style: true,
      bestPractices: true,
      documentation: false,
      testing: false,
    },
    minSeverity: 'suggestion',
    maxAnnotations: 30,
    failOn: 'critical',
  },
  files: {
    include: ['**/*'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.lock',
      '**/*.min.*',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
    ],
    maxFileSize: 100_000,
  },
  rules: [],
  prompt: {},
  cache: {
    enabled: true,
    ttl: 3600,
  },
};
