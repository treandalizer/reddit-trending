import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Mock service worker setup
beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock PointerEvent for Radix UI components
global.PointerEvent = class PointerEvent extends Event {
  constructor(type: string, eventInitDict?: PointerEventInit) {
    super(type, eventInitDict);
  }
  pointerId = 1;
  width = 1;
  height = 1;
  pressure = 0;
  tangentialPressure = 0;
  tiltX = 0;
  tiltY = 0;
  twist = 0;
  pointerType = 'mouse';
  isPrimary = false;
} as any;

// Mock hasPointerCapture for Radix UI components
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: vi.fn().mockReturnValue(false),
  writable: true,
});

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

// Mock getBoundingClientRect
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: vi.fn().mockReturnValue({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  }),
  writable: true,
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  }),
  writable: true,
});