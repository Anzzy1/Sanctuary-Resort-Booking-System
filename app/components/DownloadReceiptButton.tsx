const lightIcon = { fontVariationSettings: '"wght" 200' }

export function DownloadReceiptButton({ id }: { id: string }) {
  return (
    <a
      href={`/api/receipt/${id}`}
      className="w-full bg-primary-container text-on-tertiary px-6 py-4 rounded-lg font-body-md text-body-md font-medium hover:bg-secondary-container hover:text-primary transition-colors duration-300 flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined" style={lightIcon}>
        download
      </span>
      Download PDF Receipt
    </a>
  )
}