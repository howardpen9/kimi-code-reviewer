import type { ChatMessage } from '../types/review.js';
import { KimiApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface KimiClientConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens?: number;
  };
}

export class KimiClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private timeout: number;

  constructor(config: KimiClientConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? 'kimi-k2.5';
    this.baseUrl = config.baseUrl ?? 'https://api.moonshot.cn/v1';
    this.maxTokens = config.maxTokens ?? 16384;
    this.temperature = config.temperature ?? 1;
    this.timeout = config.timeout ?? 120_000;
  }

  async chatCompletion(params: {
    messages: ChatMessage[];
    responseFormat?: { type: 'json_object' | 'text' };
  }): Promise<ChatCompletionResponse> {
    const body = {
      model: this.model,
      messages: params.messages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      ...(params.responseFormat && { response_format: params.responseFormat }),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        throw new KimiApiError(
          `Kimi API error: ${res.status} ${res.statusText}`,
          res.status,
          errorBody,
        );
      }

      const data = (await res.json()) as ChatCompletionResponse;

      logger.info(
        {
          model: this.model,
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          cachedTokens: data.usage.cached_tokens ?? 0,
        },
        'Kimi API call completed',
      );

      return data;
    } finally {
      clearTimeout(timer);
    }
  }
}
