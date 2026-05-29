# CostLens SDK v2.0.0

[![npm version](https://img.shields.io/npm/v/costlens)](https://www.npmjs.com/package/costlens)
[![npm downloads](https://img.shields.io/npm/dm/costlens)](https://www.npmjs.com/package/costlens)

Smart AI cost optimization for **OpenAI and Anthropic**. Automatically routes expensive models to cheaper alternatives while maintaining quality. Save **up to 40%** on AI API costs with zero code changes.

## Quick Start

```typescript
import { CostLens } from 'costlens';
import OpenAI from 'openai';

const costlens = new CostLens({
  apiKey: 'cl_your_key_here' // Get yours at costlens.dev/settings
});
const openai = new OpenAI({ apiKey: 'your-openai-key' });
const ai = costlens.wrapOpenAI(openai);

const response = await ai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
// → Automatically routed to cheaper model when quality allows
```

## Features

- **Smart Model Routing**: GPT-4 → GPT-4.1-nano, Claude Opus → Claude Haiku
- **Quality Protection**: Prevents routing when quality would degrade
- **Zero Code Changes**: Drop-in wrapper for existing OpenAI/Anthropic code
- **Cost Analytics**: Track usage, costs, and savings per feature/developer
- **Token Tracking**: See where every token goes and what it ships
- **Caching**: Avoid duplicate API calls with intelligent caching
- **Kill Switch**: Auto-pause runaway agents, burst detection
- **Fallback Support**: Automatic fallback to alternative models

## Installation

```bash
npm install costlens
```

## Setup

1. Sign up at [costlens.dev](https://costlens.dev)
2. Get your API key from [Settings](https://costlens.dev/settings)
3. Wrap your OpenAI or Anthropic client:

```typescript
import { CostLens } from 'costlens';
import OpenAI from 'openai';

const costlens = new CostLens({
  apiKey: process.env.COSTLENS_API_KEY!,
});

// OpenAI
const openai = costlens.wrapOpenAI(new OpenAI());

// Anthropic
import Anthropic from '@anthropic-ai/sdk';
const anthropic = costlens.wrapAnthropic(new Anthropic());
```

## Configuration

```typescript
const costlens = new CostLens({
  apiKey: 'cl_...', // Required
  baseUrl: 'https://api.costlens.dev', // Default
  smartRouting: true, // Auto-route to cheaper models
  enableCache: true, // Cache identical requests
  logLevel: 'warn', // silent | error | warn | info
});
```

## Pricing

The SDK requires a CostLens subscription:
- **Pro** ($49/mo): Smart routing, cost analytics, caching
- **Business** ($149/mo): + token tracking, kill switch, per-feature attribution

Start a 14-day free trial at [costlens.dev](https://costlens.dev).

## Links

- [Documentation](https://costlens.dev/docs/sdk)
- [Dashboard](https://costlens.dev/dashboard)
- [Pricing](https://costlens.dev/pricing)
- [GitHub](https://github.com/Costlens-dev/costlens-sdk)
