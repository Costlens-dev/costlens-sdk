export interface CostLensConfig {
  apiKey: string;
  baseUrl?: string;
  sessionId?: string;
  enableCache?: boolean;
  maxRetries?: number;
  middleware?: Middleware[];
  autoFallback?: boolean;
  smartRouting?: boolean;
  autoOptimize?: boolean;
  costLimit?: number;
  logLevel?: 'silent' | 'error' | 'warn' | 'info';
  routingPolicy?: (
    requestedModel: string,
    messages: any[]
  ) => Promise<string | null> | string | null;
  qualityValidator?: (responseText: string, messagesJson: string) => Promise<number> | number;
  proxy?: boolean;
  proxyUrl?: string;
  providers?: ProviderConfig[];
  routingStrategy?: 'balanced' | 'quality-first' | 'cost-first' | 'custom';
  enforceModel?: boolean;
  qualityThreshold?: number;
  enableQualityValidation?: boolean;
  enableBatchProcessing?: boolean;
  enableCircuitBreaker?: boolean;
}

export interface WrapperOptions {
  promptId?: string;
  cacheTTL?: number;
  fallbackModels?: string[];
  maxCost?: number;
  userId?: string;
  requestId?: string;
  correlationId?: string;
}

export interface TrackRunData {
  provider: string;
  promptId?: string;
  model: string;
  requestedModel?: string;
  input: string;
  output: string;
  tokensUsed: number;
  inputTokens?: number;
  outputTokens?: number;
  latency: number;
  success: boolean;
  savings?: number;
  error?: string;
  requestId?: string;
  correlationId?: string;
}

export interface Middleware {
  before?: (params: any) => Promise<any>;
  after?: (result: any) => Promise<any>;
  onError?: (error: Error, context?: ErrorContext) => Promise<void>;
}

export interface ErrorContext {
  provider: string;
  model: string;
  input: string;
  latency: number;
  attempt: number;
  maxRetries: number;
  userId?: string;
  promptId?: string;
  metadata?: Record<string, any>;
}

export interface CacheEntry {
  result: any;
  timestamp: number;
  ttl: number;
  lastAccessed?: number;
}

export interface ProviderConfig {
  provider: string;
  model?: string;
  weight: number;
  minQuality: number;
  enforceModel: boolean;
  routingStrategy: string;
  apiKeyEncrypted?: string;
  enabled: boolean;
}

export interface RoutingDecision {
  selectedModel: string;
  provider: string;
  originalModel: string;
  confidence: number;
  reasoning: string;
  estimatedCost: number;
  qualityScore: number;
}

export interface RoutingOptions {
  enforceModel?: boolean;
  qualityThreshold?: number;
  maxCost?: number;
  strategy?: string;
}

export interface BatchRequest {
  provider?: string;
  model: string;
  prompt?: string;
  tokens?: number;
  latency?: number;
  options?: RoutingOptions;
}

export interface BatchResult {
  success: boolean;
  result?: any;
  error?: string;
  routingDecision?: RoutingDecision;
}

export interface QualityValidator {
  threshold: number;
  enabled: boolean;
  metrics: string[];
}

export interface QualityScore {
  overall: number;
  coherence: number;
  completeness: number;
  relevance: number;
  passed: boolean;
}

export interface ProviderApiKey {
  id: string;
  provider: string;
  createdAt: string;
  lastUsedAt?: string;
}
