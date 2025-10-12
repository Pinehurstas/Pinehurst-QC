import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error?.message || error) }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App crash:', error, errorInfo)
    // no-op; we also rely on global diagnostics in initDiagnostics
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Something went wrong</h2>
          <p>{this.state.message}</p>
          <button onClick={() => location.reload()}>Reload app</button>
        </div>
      )
    }
    return this.props.children
  }
}
