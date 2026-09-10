import { describe, expect, it } from 'vitest';
import { getCategoryLabel } from '../src/lib/taxonomy';

describe('getCategoryLabel', () => {
  it('returns the Chinese label for an AI learning category', () => {
    expect(getCategoryLabel('ai', 'learning')).toBe('个人学习与总结');
  });

  it('rejects a category that does not belong to the channel', () => {
    expect(() => getCategoryLabel('trading', 'learning')).toThrow('无效栏目');
  });
});
