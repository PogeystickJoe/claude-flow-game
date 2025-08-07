import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Claude Flow MCP tools globally
jest.mock('claude-flow-mcp', () => ({
  swarmInit: jest.fn(),
  agentSpawn: jest.fn(),
  taskOrchestrate: jest.fn(),
  neuralTrain: jest.fn(),
  memoryUsage: jest.fn()
}));

// Mock WebSocket for multiplayer tests
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1
})) as any;

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn()
} as any;

// Console spy setup for witty test messages
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'test') {
    originalLog(...args);
  }
};

// Global test utilities
global.waitForSwarmSync = async (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

global.expectSwarmBehavior = (mockFn: jest.Mock, expectedCalls: any[]) => {
  expect(mockFn).toHaveBeenCalledTimes(expectedCalls.length);
  expectedCalls.forEach((call, index) => {
    expect(mockFn).toHaveBeenNthCalledWith(index + 1, ...call);
  });
};