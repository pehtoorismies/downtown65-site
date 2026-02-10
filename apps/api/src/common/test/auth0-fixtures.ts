import {
  auth0MockState,
  createDefaultTestUser,
  createMockAuth0User,
  type MockAuth0User,
} from './auth0-mock'

/**
 * Seeds the Auth0 mock with multiple users.
 * Returns the created users for use in assertions.
 */
export function seedAuth0Users(count: number): MockAuth0User[] {
  const users: MockAuth0User[] = []

  for (let i = 0; i < count; i++) {
    const user = createMockAuth0User({
      email: `seeded-${i}@example.com`,
      name: `Seeded User ${i}`,
      nickname: `seeded-user-${i}`,
      user_id: `auth0|seeded-user-${i}`,
    })
    auth0MockState.users.set(user.user_id, user)
    users.push(user)
  }

  return users
}

/**
 * Adds a specific user to the Auth0 mock.
 * Useful when you need a user with specific properties.
 */
export function addAuth0User(overrides: Partial<MockAuth0User>): MockAuth0User {
  const user = createMockAuth0User(overrides)
  auth0MockState.users.set(user.user_id, user)
  return user
}

/**
 * Sets up an error response for a specific Auth0 method.
 * The error will be thrown on the next call to that method.
 */
export function setAuth0Error(
  method: 'get' | 'list' | 'update' | 'create',
  error: { statusCode: number; message: string },
) {
  auth0MockState.errors[method] = {
    error: error.message,
    message: error.message,
    statusCode: error.statusCode,
  }
}

/**
 * Clears any configured error for a method.
 */
export function clearAuth0Error(method: 'get' | 'list' | 'update' | 'create') {
  auth0MockState.errors[method] = null
}

/**
 * Clears all Auth0 mock state and restores defaults.
 * Should be called in beforeEach.
 */
export function resetAuth0Mock() {
  auth0MockState.reset()
  // Re-add the default test user that matches jwk-mock.ts
  auth0MockState.users.set('auth0|user-123', createDefaultTestUser())
}

/**
 * Gets the current state of a user in the mock.
 * Useful for verifying that updates were applied.
 */
export function getAuth0MockUser(userId: string): MockAuth0User | undefined {
  return auth0MockState.users.get(userId)
}

/**
 * Gets all users currently in the Auth0 mock.
 */
export function getAllAuth0MockUsers(): MockAuth0User[] {
  return Array.from(auth0MockState.users.values())
}
