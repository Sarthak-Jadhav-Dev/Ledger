/**
 * Safely downloads a file from a URL without navigating the page.
 * Uses fetch + blob to avoid cross-origin issues with the <a download> attribute
 * which causes page navigation instead of file download when origins differ.
 */
export const safeDownload = async (fileUrl, filename) => {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename || 'download'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    }, 100)
  } catch (err) {
    console.error('Download failed, falling back to window.open:', err)
    window.open(fileUrl, '_blank')
  }
}
