import { spawnSync } from 'node:child_process'
import {
  existsSync,
  openSync,
  closeSync,
  unlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const HOST = 'los-deploy'
const archive = join(tmpdir(), 'botslate-site.tar.gz')

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`)

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html does not exist. Build the site first.')
  process.exit(1)
}

try {
  // 打包 Astro 静态产物
  run('tar', [
    '-czf',
    archive,
    '-C',
    'dist',
    '.',
  ])

  // 将压缩包直接通过 SSH stdin 发送给服务器。
  // 服务器端 ForceCommand 会自动执行 deploy-botslate。
  console.log(`\n> deploying to ${HOST}`)

  const fd = openSync(archive, 'r')

  const result = spawnSync(
    'ssh',
    ['-T', HOST],
    {
      stdio: [fd, 'inherit', 'inherit'],
      shell: false,
    },
  )

  closeSync(fd)

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  console.log('\n✓ botslate.com deployed successfully.')
} finally {
  if (existsSync(archive)) {
    unlinkSync(archive)
  }
}