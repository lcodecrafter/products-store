import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders the logo variant sourced from the logo asset', () => {
    const { container } = render(<Icon name="logo" />)
    const img = container.querySelector('img')

    expect(img).toBeInTheDocument()
    expect(decodeURIComponent(img?.src ?? '')).toContain("viewBox='0 0 77 29'")
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders the bag variant sourced from the bag asset', () => {
    const { container } = render(<Icon name="bag" />)
    const img = container.querySelector('img')

    expect(img).toBeInTheDocument()
    expect(decodeURIComponent(img?.src ?? '')).toContain("viewBox='0 0 13 16'")
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })
})
