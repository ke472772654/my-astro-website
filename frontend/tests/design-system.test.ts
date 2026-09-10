import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

describe('global design system', () => {
  it('defines the shared modern blog visual tokens', async () => {
    const css = await readFile(resolve(currentDir, '../src/styles/global.css'), 'utf8');

    expect(css).toContain('--text-primary: #0f172a');
    expect(css).toContain('--text-muted: #475569');
    expect(css).toContain('--border: #e2e8f0');
    expect(css).toContain('Inter, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif');
    expect(css).toContain('.badge');
    expect(css).toContain('border-radius: 999px');
  });

  it('keeps the hero title and navigation usable on narrow screens', async () => {
    const css = await readFile(resolve(currentDir, '../src/styles/global.css'), 'utf8');

    expect(css).toContain('font-size: clamp(1.875rem, 4vw, 2.75rem)');
    expect(css).toContain('word-break: keep-all');
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('overflow-x: auto');
    expect(css).toContain('width: min(100% - 2rem, 72rem)');
  });
});
