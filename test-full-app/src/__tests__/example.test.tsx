import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/utils'

describe('Example Test', () => {
  it('should render hello world', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})