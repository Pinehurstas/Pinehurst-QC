import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'
import { registerSW } from './sw-registration'
import { initDiagnostics } from './initDiagnostics'

// Initialize diagnostics overlay early
initDiagnostics()

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Register service worker after initial render
registerSW()
