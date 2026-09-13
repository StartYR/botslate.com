import { spawnSync } from 'node:child_process'
import { existsSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const HOST = 'losvps'
const REMOTE_ARCHIVE = '/tmp/botslate-site.tar.gz'
const REMOTE_SITE = '/var/www/botslate/site'

const archive = join(tmpdir(), 'botslate-site.tar.gz')

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`)

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!existsSync('dist')) {
  console.error('dist directory does not exist.')
  process.exit(1)
}

try {
  // 将 Astro 构建产物打包
  run('tar', [
    '-czf',
    archive,
    '-C',
    'dist',
    '.',
  ])

  // 上传到 VPS
  run('scp', [
    archive,
    `${HOST}:${REMOTE_ARCHIVE}`,
  ])

  // 在服务器上解压并替换当前网站
  const remoteCommand = `
set -e

LIVE="${REMOTE_SITE}"
NEW="${REMOTE_SITE}.new"
OLD="${REMOTE_SITE}.old"
ARCHIVE="${REMOTE_ARCHIVE}"

rm -rf "$NEW"
mkdir -p "$NEW"

tar -xzf "$ARCHIVE" -C "$NEW"
rm -f "$ARCHIVE"

rm -rf "$OLD"

if [ -d "$LIVE" ]; then
    mv "$LIVE" "$OLD"
fi

mv "$NEW" "$LIVE"

rm -rf "$OLD"

echo "Deployment completed."
`

  run('ssh', [
    HOST,
    remoteCommand,
  ])

  console.log('\n✓ botslate.com deployed successfully.')
} finally {
  if (existsSync(archive)) {
    unlinkSync(archive)
  }
}