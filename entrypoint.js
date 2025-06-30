// entrypoint.js

// Import required polyfills first
// IMPORTANT: These polyfills must be installed in this order
import '@ethersproject/shims'
// import { Buffer } from 'buffer'
import 'react-native-get-random-values'

// global.Buffer = global.Buffer || require('buffer').Buffer

// Explicitly add text-encoding polyfill needed for ReadableStream
import 'text-encoding'

// Buffer polyfill must be loaded before other dependencies
import { Buffer } from 'buffer'
global.Buffer = Buffer

// START --- Polyfill process object ---
if (typeof global.process === 'undefined') {
  global.process = require('process')
}
// It's also common for libraries to expect process.env
if (typeof global.process.env === 'undefined') {
  global.process.env = {}
}
// Ensure nextTick is available for some libraries
if (typeof global.process.nextTick === 'undefined') {
  global.process.nextTick = setImmediate
}
// END --- Polyfill process object ---

// Import polyfills early - this will handle ReadableStream and EventEmitter
import './libs/polyfills'

// Add a fallback for ReadableStream (this should be handled in polyfills.ts)
if (typeof global.ReadableStream === 'undefined') {
  console.warn(
    'ReadableStream still not defined after polyfills - using minimal stub'
  )
  global.ReadableStream = class MockReadableStream {
    constructor() {}
    getReader() {
      return {
        read: async () => ({ done: true, value: undefined }),
        releaseLock: () => {},
      }
    }
  }
}

if (typeof Settings === 'undefined') {
  global.Settings = {}
}

// Then import the expo router
import 'expo-router/entry'
