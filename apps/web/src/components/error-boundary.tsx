import { Component, PropsWithChildren, ReactNode } from 'react';

export class ErrorBoundary extends Component<PropsWithChildren, { error?: ReactNode }> {
  state = { error: undefined };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) return <div className="m-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-100">{this.state.error}</div>;
    return this.props.children;
  }
}
