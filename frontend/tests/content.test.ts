import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, getFeaturedPosts, getRelatedPosts, sortPosts } from '../src/lib/content';

describe('content helpers', () => {
  it('sorts newer posts before older posts', () => {
    const posts = [
      { data: { pubDate: new Date('2026-01-01') } },
      { data: { pubDate: new Date('2026-02-01') } },
    ];

    expect(sortPosts(posts)[0].data.pubDate.toISOString()).toContain('2026-02-01');
  });

  it('rounds Chinese reading time up to whole minutes', () => {
    expect(estimateReadingMinutes('字'.repeat(299))).toBe(1);
    expect(estimateReadingMinutes('字'.repeat(301))).toBe(2);
  });

  it('puts pinned posts before featured posts', () => {
    const posts = [
      { id: 'featured', data: { pinned: false, featured: true, pubDate: new Date('2026-03-01'), tags: [] } },
      { id: 'pinned', data: { pinned: true, featured: false, pubDate: new Date('2026-01-01'), tags: [] } },
    ];

    expect(getFeaturedPosts(posts).map((post) => post.id)).toEqual(['pinned', 'featured']);
  });

  it('sorts related posts by number of shared tags and excludes the current post', () => {
    const posts = [
      { id: 'current', data: { pinned: false, featured: false, pubDate: new Date('2026-03-01'), tags: ['AI', '工作流'] } },
      { id: 'one-match', data: { pinned: false, featured: false, pubDate: new Date('2026-03-02'), tags: ['AI'] } },
      { id: 'two-matches', data: { pinned: false, featured: false, pubDate: new Date('2026-01-01'), tags: ['AI', '工作流'] } },
    ];

    expect(getRelatedPosts(posts, 'current', ['AI', '工作流']).map((post) => post.id)).toEqual(['two-matches', 'one-match']);
  });
});
