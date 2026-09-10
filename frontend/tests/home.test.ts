import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

describe('home page', () => {
  it('renders both primary content channels', async () => {
    const html = await readFile(resolve(currentDir, '../dist/index.html'), 'utf8');

    expect(html).toContain('AI 应用技术分享');
    expect(html).toContain('交易系统分享');
  });
});
