import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const routes = ['newsletter']

const indexHtmlPath = path.join(distDir, 'index.html')
const indexHtml = await fs.readFile(indexHtmlPath, 'utf8')

for (const route of routes) {
  const routeDir = path.join(distDir, route)
  await fs.mkdir(routeDir, { recursive: true })
  await fs.writeFile(path.join(routeDir, 'index.html'), indexHtml, 'utf8')
}

console.log(`Static route entries written: ${routes.join(', ')}`)
