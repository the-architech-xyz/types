/**
 * Vitest Testing Blueprint
 * 
 * Sets up Vitest testing framework with coverage
 */

import { Blueprint } from '../../../types/adapter.js';

export const vitestBlueprint: Blueprint = {
  id: 'vitest-setup',
  name: 'Vitest Testing Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event'
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

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
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
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}`
    }
  ]
};
