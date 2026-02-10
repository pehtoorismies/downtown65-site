import { describe, expect, it } from 'vitest'
import { getOpenAPISpec } from '../open-api/get-open-api'

describe('Generate OpenAPI', async () => {
  it('should generate OpenAPI spec', async () => {
    const openAPI = await getOpenAPISpec()
    expect(openAPI).toBeDefined()
  })
})
