/**
 * Vitest Testing Blueprint
 * 
 * Sets up Vitest testing framework with coverage
 */

import { Blueprint } from '../../../types/adapter.js';

export const vitestBlueprint: Blueprint = {
  id: 'vitest-base-setup',
  name: 'Vitest Base Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom'
    },
    {
      type: 'ADD_CONTENT',
      target: 'vitest.config.ts',
      content: `/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/test/setup.ts',
      content: `import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/test/utils.tsx',
      content: `import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/__tests__/example.test.tsx',
      content: `import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/utils'

describe('Example Test', () => {
  it('should render hello world', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})`
    },
    {
      type: 'ADD_CONTENT',
      target: 'package.json',
      content: `{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}`
    }
  ]
};
