// import { env } from 'cloudflare:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import app from '../src/server'

const generateOpenAPI = async () => {
  const res = await app.request('/doc', { method: 'GET' })
  const openapi = await res.json()

  mkdirSync('./.generated', { recursive: true })

  writeFileSync(
    './.generated/openapi.json',
    JSON.stringify(openapi, null, 2),
    'utf-8',
  )

  // biome-ignore lint/suspicious/noConsole: Script file
  console.log('✅ OpenAPI spec generated at ./.generated/openapi.json')
}

generateOpenAPI()
