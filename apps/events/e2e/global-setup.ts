async function globalSetup() {
  const apiUrl = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:3002'
  const apiKey = process.env.API_KEY
  const syncUrl = `${apiUrl}/syncUsers`

  if (!apiKey) {
    console.warn(
      'Warning: API_KEY environment variable not set. User sync may fail.',
    )
  }

  console.log('Global setup: Syncing users from Auth0...')

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey ?? '',
      },
    })

    if (!response.ok) {
      console.warn(
        `Warning: Failed to sync users. Status: ${response.status}. Tests may fail if test user doesn't exist.`,
      )
    } else {
      console.log('✓ Users synced successfully')
    }
  } catch (error) {
    console.warn(
      'Warning: Could not reach syncUsers endpoint. Make sure API is running.',
      error,
    )
  }
}

export default globalSetup
