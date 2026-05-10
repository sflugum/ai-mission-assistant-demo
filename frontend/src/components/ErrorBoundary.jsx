import { ErrorBoundary } from 'react-error-boundary'

function Fallback({ resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <p className="text-lg text-slate-200">Something went wrong</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        Try Again
      </button>
    </div>
  )
}

export default function AppErrorBoundary({ children }) {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>
}
