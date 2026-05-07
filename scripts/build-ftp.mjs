import { spawn } from 'node:child_process'

const child = spawn(process.execPath, ['scripts/vite-runner.mjs', 'build'], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    APP_BASE_PATH: '/sword/',
  },
})

child.on('exit', async (code) => {
  if (code) {
    process.exit(code)
  }

  const postBuild = spawn(process.execPath, ['scripts/postbuild-static-routes.mjs'], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })

  postBuild.on('exit', (postBuildCode) => {
    process.exit(postBuildCode ?? 0)
  })
})
