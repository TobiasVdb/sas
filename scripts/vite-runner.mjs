import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viteEntry = path.resolve(__dirname, '../node_modules/vite/bin/vite.js')
const args = process.argv.slice(2)

const child = spawn(process.execPath, [viteEntry, ...args], {
  stdio: 'inherit',
  shell: false,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
