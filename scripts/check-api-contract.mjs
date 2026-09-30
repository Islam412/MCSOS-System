import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(here, '../src/services/api/config.js')

const ALLOWED_MISSING = new Set([
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
])

function normalize(route) {
  return route
    .replace(/\$\{[^}]+\}/g, '{}')
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/:[A-Za-z0-9_]+/g, '{}')
    .replace(/\/+$/, '')
}

function pathsFromConfig(source) {
  const found = source.match(/\/api\/v1\/[A-Za-z0-9_${}\/:-]+/g) || []
  return [...new Set(found.map(normalize))]
}

function pathsFromSwagger(document) {
  return Object.keys(document.paths || {}).map(normalize)
}

export function missingPaths(configSource, swagger) {
  const declared = pathsFromConfig(configSource)
  const served = new Set(pathsFromSwagger(swagger))
  return declared.filter((route) => !ALLOWED_MISSING.has(route) && !served.has(route))
}

async function loadSwagger(source) {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`Swagger request failed: ${response.status}`)
    return response.json()
  }
  return JSON.parse(fs.readFileSync(source, 'utf8'))
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const configSource = fs.readFileSync(configPath, 'utf8')
  const arg = process.argv[2]
  if (arg === '--expect-fail') {
    const misses = missingPaths(configSource + '\nconst fake = \'/api/v1/not-a-real-route\'\n', { paths: {} })
    if (!misses.includes('/api/v1/not-a-real-route')) {
      console.error('Contract check did not notice a fake path')
      process.exit(1)
    }
    console.log('Contract check rejects a path the server does not serve')
    process.exit(0)
  }
  if (!arg) {
    console.error('Usage: node scripts/check-api-contract.mjs <swagger.json | swagger-url> | --expect-fail')
    process.exit(1)
  }
  const swagger = await loadSwagger(arg)
  const misses = missingPaths(configSource, swagger)
  if (misses.length) {
    console.error('config.js paths missing from the API:')
    for (const route of misses) console.error(`  ${route}`)
    process.exit(1)
  }
  console.log('Every config.js path is on the API')
}
