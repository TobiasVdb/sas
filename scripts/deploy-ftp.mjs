import ftp from 'basic-ftp'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const host = process.env.FTP_HOST || 'ftp.frost-design.be'
const remoteDir = process.env.FTP_REMOTE_DIR || '/httpdocs/sword'
const user = process.env.FTP_USER
const password = process.env.FTP_PASSWORD

if (!user || !password) {
  console.error('FTP deployment skipped: set FTP_USER and FTP_PASSWORD first.')
  process.exit(1)
}

if (!fs.existsSync(distDir)) {
  console.error(`FTP deployment failed: dist directory not found at ${distDir}`)
  process.exit(1)
}

const client = new ftp.Client()
client.ftp.verbose = false

try {
  await client.access({
    host,
    user,
    password,
    secure: false,
  })

  await client.ensureDir(remoteDir)
  await client.clearWorkingDir()
  await client.uploadFromDir(distDir)

  console.log(`FTP deploy complete: ${host}${remoteDir}`)
} catch (error) {
  console.error('FTP deploy failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  client.close()
}
