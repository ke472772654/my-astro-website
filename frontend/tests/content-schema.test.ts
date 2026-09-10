import { describe, expect, it } from 'vitest';
import { articleFrontmatterSchema } from '../src/lib/content-schema';

describe('articleFrontmatterSchema', () => {
  it('rejects an AI-only category in the trading channel', () => {
    const result = articleFrontmatterSchema.safeParse({
      title: '测试文章',
      description: '用于验证栏目边界。',
      pubDate: '2026-09-10',
      channel: 'trading',
      category: 'learning',
      tags: ['测试'],
      type: 'article',
    });

    expect(result.success).toBe(false);
  });
});
