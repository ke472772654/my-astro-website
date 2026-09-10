import { describe, expect, it } from 'vitest';

describe('site configuration', () => {
  it('uses the local development URL by default', async () => {
    const config = await import('../astro.config.mjs');

    expect(config.default.site).toBe('http://localhost:4321');
  });
});
