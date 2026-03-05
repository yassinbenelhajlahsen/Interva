import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-lg font-semibold text-app-text-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-app-text-secondary mb-6">{this.state.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-app-brand transition-opacity hover:opacity-90"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
