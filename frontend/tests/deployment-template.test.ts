import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
const deployScriptPath = resolve(currentDir, '../../backend/scripts/deploy.sh');
const workflowPath = resolve(currentDir, '../../.github/workflows/deploy.yml');

describe('deployment script', () => {
  it('validates the release before atomically switching the current symlink', async () => {
    const script = await readFile(deployScriptPath, 'utf8');

    expect(script).toContain('set -eu');
    expect(script).toContain('test -f "$release_dir/index.html"');
    expect(script).toContain('mv -Tf "${current_link}.next" "$current_link"');
  });
});

describe('deployment workflow', () => {
  it('uses the configured server secrets and a pinned SSH connection', async () => {
    const workflow = await readFile(workflowPath, 'utf8');

    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('SERVER_IP: ${{ secrets.SERVER_IP }}');
    expect(workflow).toContain('SERVER_USER: ${{ secrets.SERVER_USER }}');
    expect(workflow).toContain('SERVER_SSH_KEY: ${{ secrets.SERVER_SSH_KEY }}');
    expect(workflow).toContain('SERVER_DEPLOY_PATH: ${{ secrets.SERVER_DEPLOY_PATH }}');
    expect(workflow).not.toContain('SERVER_KNOWN_HOSTS:');
    expect(workflow).toContain('-p 5522');
    expect(workflow).toContain('-o StrictHostKeyChecking=no');
    expect(workflow).toContain('-o UserKnownHostsFile=/dev/null');
    expect(workflow).toContain('uses: pnpm/action-setup@v4');
    expect(workflow.indexOf('uses: pnpm/action-setup@v4')).toBeLessThan(workflow.indexOf('uses: actions/setup-node@v4'));
    expect(workflow.indexOf('pnpm run build')).toBeLessThan(workflow.indexOf('pnpm run test'));
  });
});
