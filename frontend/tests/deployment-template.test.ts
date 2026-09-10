import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const deployScriptPath = resolve(currentDir, '../../backend/scripts/deploy.sh');

describe('deployment script', () => {
  it('validates the release before atomically switching the current symlink', async () => {
    const script = await readFile(deployScriptPath, 'utf8');

    expect(script).toContain('set -eu');
    expect(script).toContain('test -f "$release_dir/index.html"');
    expect(script).toContain('mv -Tf "${current_link}.next" "$current_link"');
  });
});
