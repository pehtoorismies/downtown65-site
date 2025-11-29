import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testRender } from '~/utils/test-render'
import { Welcome } from './welcome'

describe('Welcome', () => {
  it('should render successfully', () => {
    testRender(<Welcome />)
    expect(screen.getByText(/What's kupp?/i)).toBeInTheDocument()
  })
})
