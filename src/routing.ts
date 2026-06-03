import { QualityDetector } from './qualityDetector';

/**
 * Estimate prompt complexity from messages.
 */
export function estimateComplexity(messages: any[]): 'simple' | 'medium' | 'complex' {
  const totalLength = messages.reduce((sum: number, m: any) => sum + (m.content?.length || 0), 0);
  const hasSystemPrompt = messages.some((m: any) => m.role === 'system');
  const messageCount = messages.length;

  if (totalLength < 100 && !hasSystemPrompt && messageCount <= 2) return 'simple';
  if (totalLength < 500 && messageCount <= 5) return 'medium';
  return 'complex';
}

/**
 * Detect task type from message content.
 */
export function detectTaskType(messages: any[]): string[] {
  const text = messages.map((m: any) => m.content).join(' ').toLowerCase();
  const types: string[] = [];

  if (/code|programming|function|debug|algorithm/.test(text)) types.push('coding');
  if (/write|creative|story|article|content/.test(text)) types.push('writing');
  if (/analyze|research|evaluate|compare/.test(text)) types.push('analysis');
  if (/translate|language/.test(text)) types.push('translation');
  if (/math|calculate|solve|equation/.test(text)) types.push('math');
  if (/simple|basic|quick|easy/.test(text)) types.push('simple');

  return types;
}

/**
 * Select the optimal model based on complexity and task type.
 */
export async function selectOptimalModel(
  requestedModel: string,
  messages: any[],
  routingPolicy?: (model: string, msgs: any[]) => Promise<string | null> | string | null
): Promise<string> {
  // Custom routing policy takes precedence
  if (routingPolicy) {
    try {
      const routed = await routingPolicy(requestedModel, messages);
      if (routed && typeof routed === 'string') return routed;
    } catch (e) {
      console.warn('[CostLens] routingPolicy error (non-fatal):', e);
    }
  }

  // Don't route vision models
  if (requestedModel.includes('vision')) return requestedModel;

  const complexity = estimateComplexity(messages);

  // OpenAI routing
  if (requestedModel.includes('gpt') || requestedModel.includes('o4') || requestedModel.includes('o3')) {
    if (complexity === 'simple' && (requestedModel.includes('gpt-4') || requestedModel.includes('gpt-5'))) {
      return 'gpt-4o-mini';
    }
    if (complexity === 'medium' && (requestedModel === 'gpt-4' || requestedModel.includes('gpt-5'))) {
      return 'gpt-4o';
    }
    if (complexity === 'simple' && (requestedModel.includes('o4') || requestedModel.includes('o3'))) {
      return 'o4-mini';
    }
  }

  // Anthropic routing
  if (requestedModel.includes('claude')) {
    if (complexity === 'simple' && requestedModel.includes('opus')) {
      return 'claude-3-5-haiku-latest';
    }
    if (complexity === 'medium' && requestedModel.includes('opus')) {
      return 'claude-sonnet-4-20250514';
    }
    if (complexity === 'simple' && requestedModel.includes('sonnet')) {
      return 'claude-3-5-haiku-latest';
    }
  }

  // Cross-provider routing
  const routingDecision = QualityDetector.shouldRoute(requestedModel, messages, 0.8);
  if (routingDecision.shouldRoute && routingDecision.confidence > 0.8) {
    return routingDecision.targetModel;
  }

  return requestedModel;
}

/**
 * Get default fallback models for a given model.
 */
export function getDefaultFallbacks(model: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'gpt-5.5': ['gpt-4o', 'gpt-4o-mini'],
    'gpt-4o': ['gpt-4o-mini', 'claude-3-5-haiku-latest'],
    'gpt-4o-mini': ['claude-3-5-haiku-latest'],
    'o4-mini': ['gpt-4o-mini', 'claude-3-5-haiku-latest'],
    'o4': ['o4-mini', 'gpt-4o'],
    'o3': ['o4-mini', 'gpt-4o'],
    'claude-opus-4': ['claude-sonnet-4-20250514', 'claude-3-5-haiku-latest'],
    'claude-sonnet-4': ['claude-3-5-haiku-latest', 'gpt-4o-mini'],
    'claude-3-5-haiku': ['gpt-4o-mini'],
    'gpt-4': ['gpt-4o', 'gpt-4o-mini'],
    'gpt-4-turbo': ['gpt-4o', 'gpt-4o-mini'],
    'gpt-3.5-turbo': ['gpt-4o-mini'],
    'claude-3-opus': ['claude-sonnet-4-20250514', 'claude-3-5-haiku-latest'],
    'claude-3.5-sonnet': ['claude-3-5-haiku-latest', 'gpt-4o-mini'],
    'claude-3-sonnet': ['claude-3-5-haiku-latest', 'gpt-4o-mini'],
    'claude-3-haiku': ['gpt-4o-mini'],
    'deepseek-v3': ['deepseek-chat', 'gpt-4o-mini'],
    'deepseek-r1': ['o4-mini', 'deepseek-chat'],
  };

  for (const [key, value] of Object.entries(fallbacks)) {
    if (model.includes(key)) return value;
  }

  return [];
}
