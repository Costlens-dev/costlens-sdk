import { CostLens } from '../src/index';

describe('Streaming', () => {
  let costlens: CostLens;

  beforeEach(() => {
    costlens = new CostLens({ apiKey: 'test-key', smartRouting: false });
    // Suppress tracking calls
    (costlens as any).trackRun = jest.fn().mockResolvedValue(undefined);
    (costlens as any).trackError = jest.fn().mockResolvedValue(undefined);
  });

  describe('OpenAI streaming', () => {
    it('should validate params before streaming', async () => {
      const mockClient = { chat: { completions: { create: jest.fn() } } };
      const wrapped = costlens.wrapOpenAI(mockClient);

      await expect(
        wrapped.chat.completions.stream({ model: '', messages: [] })
      ).rejects.toThrow('stream requires model and messages');
    });

    it('should yield chunks and track usage after completion', async () => {
      const chunks = [
        { choices: [{ delta: { content: 'Hello' } }] },
        { choices: [{ delta: { content: ' world' } }] },
        { choices: [{ delta: {} }], usage: { prompt_tokens: 10, completion_tokens: 5 } },
      ];

      const mockStream = (async function* () {
        for (const chunk of chunks) yield chunk;
      })();

      const mockClient = {
        chat: { completions: { create: jest.fn().mockResolvedValue(mockStream) } },
      };

      const wrapped = costlens.wrapOpenAI(mockClient);
      const stream = await wrapped.chat.completions.stream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hi' }],
      });

      const received: string[] = [];
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) received.push(content);
      }

      expect(received).toEqual(['Hello', ' world']);
      expect((costlens as any).trackRun).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'openai',
          model: 'gpt-4o',
          output: 'Hello world',
          inputTokens: 10,
          outputTokens: 5,
          success: true,
        })
      );
    });

    it('should enforce cost limits on streams', async () => {
      const costlensWithLimit = new CostLens({
        apiKey: 'test-key',
        smartRouting: false,
        costLimit: 0.0000001, // impossibly low
      });

      const mockClient = { chat: { completions: { create: jest.fn() } } };
      const wrapped = costlensWithLimit.wrapOpenAI(mockClient);

      await expect(
        wrapped.chat.completions.stream({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Write a long essay about everything' }],
        })
      ).rejects.toThrow('exceeds limit');
    });

    it('should track errors on stream failure', async () => {
      const mockClient = {
        chat: { completions: { create: jest.fn().mockRejectedValue(new Error('Rate limited')) } },
      };

      const wrapped = costlens.wrapOpenAI(mockClient);

      await expect(
        wrapped.chat.completions.stream({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hi' }],
        })
      ).rejects.toThrow('Rate limited');

      expect((costlens as any).trackError).toHaveBeenCalled();
    });
  });

  describe('Anthropic streaming', () => {
    it('should validate params before streaming', async () => {
      const mockClient = { messages: { create: jest.fn() } };
      const wrapped = costlens.wrapAnthropic(mockClient);

      await expect(
        wrapped.messages.stream({ model: '', messages: [] })
      ).rejects.toThrow('stream requires model and messages');
    });

    it('should yield events and track usage after completion', async () => {
      const events = [
        { type: 'message_start', message: { usage: { input_tokens: 15 } } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hi' } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: ' there' } },
        { type: 'message_delta', usage: { output_tokens: 8 } },
      ];

      const mockStream = (async function* () {
        for (const event of events) yield event;
      })();

      const mockClient = {
        messages: { create: jest.fn().mockResolvedValue(mockStream) },
      };

      const wrapped = costlens.wrapAnthropic(mockClient);
      const stream = await wrapped.messages.stream({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const received: string[] = [];
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          received.push(event.delta.text);
        }
      }

      expect(received).toEqual(['Hi', ' there']);
      expect((costlens as any).trackRun).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          output: 'Hi there',
          inputTokens: 15,
          outputTokens: 8,
          success: true,
        })
      );
    });

    it('should track errors on stream failure', async () => {
      const mockClient = {
        messages: { create: jest.fn().mockRejectedValue(new Error('Overloaded')) },
      };

      const wrapped = costlens.wrapAnthropic(mockClient);

      await expect(
        wrapped.messages.stream({
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: 'Hi' }],
        })
      ).rejects.toThrow('Overloaded');

      expect((costlens as any).trackError).toHaveBeenCalled();
    });
  });
});
