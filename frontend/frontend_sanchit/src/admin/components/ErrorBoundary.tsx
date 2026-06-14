import React from "react";

export class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: Error }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You can log error to monitoring service here
    // console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-sm text-red-400">
          <p>Something went wrong rendering this section.</p>
          <pre className="mt-3 text-xs text-slate-400">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
