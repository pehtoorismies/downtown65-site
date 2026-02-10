import { mkdirSync, writeFileSync } from 'node:fs'
import { getOpenAPISpec } from '../src/common/open-api/get-open-api'

const openapi = await getOpenAPISpec()
mkdirSync('./.generated', { recursive: true })
writeFileSync(
  './.generated/openapi.json',
  JSON.stringify(openapi, null, 2),
  'utf-8',
)
// biome-ignore lint/suspicious/noConsole: Script file
console.log('✅ OpenAPI spec generated at ./.generated/openapi.json')
