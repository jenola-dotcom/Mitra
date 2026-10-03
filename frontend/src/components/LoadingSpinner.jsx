export default function LoadingSpinner({ label }) {
  return (
    <div className="flex min-h-[30vh] w-full flex-col items-center justify-center gap-3 text-soil-700">
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-soil-200 border-t-leaf-600"
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
