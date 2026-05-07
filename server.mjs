import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.PORT || 8080)
const host = '0.0.0.0'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const type = mimeTypes[ext] || 'application/octet-stream'

  res.writeHead(200, { 'Content-Type': type })
  fs.createReadStream(filePath).pipe(res)
}

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0])
  const normalized = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  return path.join(distDir, normalized)
}

const server = http.createServer((req, res) => {
  if (!fs.existsSync(distDir)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('dist directory not found. Run the build step before starting the server.')
    return
  }

  const requestPath = resolveRequestPath(req.url || '/')
  const indexPath = path.join(distDir, 'index.html')

  if (fs.existsSync(requestPath) && fs.statSync(requestPath).isFile()) {
    sendFile(res, requestPath)
    return
  }

  if (fs.existsSync(requestPath) && fs.statSync(requestPath).isDirectory()) {
    const nestedIndexPath = path.join(requestPath, 'index.html')
    if (fs.existsSync(nestedIndexPath)) {
      sendFile(res, nestedIndexPath)
      return
    }
  }

  if (fs.existsSync(indexPath)) {
    sendFile(res, indexPath)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not found')
})

server.listen(port, host, () => {
  console.log(`Static server listening on http://${host}:${port}`)
})
