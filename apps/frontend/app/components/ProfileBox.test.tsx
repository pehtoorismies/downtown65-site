import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, expect, it } from 'vitest'
import { testRender } from '~/utils/test-render'
import { ProfileBox } from './ProfileBox'

describe('ProfileBox', () => {
  it('should render successfully', () => {
    testRender(
      <ProfileBox
        email="test@example.com"
        name="Ada Lovelace"
        nickname="adanis"
        picture={'https://example.com/picture.jpg'}
      />,
    )
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Ada Lovelace/i)).toBeInTheDocument()
    expect(screen.getByText(/adanis/i)).toBeInTheDocument()
  })
})
