import { ErrorBoundary } from 'react-error-boundary'

/**
 * @param {{ resetErrorBoundary: () => void }} props - `resetErrorBoundary`
 * is supplied by react-error-boundary; calling it clears the error state
 * and re-renders the wrapped children instead of reloading the page.
 */
function Fallback({ resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <p className="text-lg text-slate-200">Something went wrong</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 outline-none focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-slate-300"
      >
        Try Again
      </button>
    </div>
  )
}

/**
 * Wraps the app in a top-level error boundary so a render error in one part
 * of the tree shows a fallback screen instead of a blank white page. This
 * only catches render-time errors in React components below it. It won't
 * catch errors from event handlers or async code (e.g. fetch failures),
 * those need their own try/catch or error state.
 */
export default function AppErrorBoundary({ children }) {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>
}
