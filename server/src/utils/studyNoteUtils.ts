export interface DriveUrls {
  rawUrl: string;
  previewUrl: string;
  downloadUrl: string;
  isGoogleDoc: boolean;
  fileId: string | null;
}

/**
 * Automatically parses Google Drive or Google Docs URLs to generate:
 * 1. Embedded reader preview URL (/preview)
 * 2. Instant 1-click direct download URL (uc?export=download for Drive, /export?format=pdf for Docs)
 */
export function parseDriveUrl(url: string): DriveUrls {
  if (!url) {
    return { rawUrl: '', previewUrl: '', downloadUrl: '', isGoogleDoc: false, fileId: null };
  }

  const trimmed = url.trim();

  // 1. Google Docs: https://docs.google.com/document/d/([a-zA-Z0-9_-]+)
  const docMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    const fileId = docMatch[1];
    return {
      rawUrl: trimmed,
      previewUrl: `https://docs.google.com/document/d/${fileId}/preview`,
      downloadUrl: `https://docs.google.com/document/d/${fileId}/export?format=pdf`,
      isGoogleDoc: true,
      fileId,
    };
  }

  // 2. Google Spreadsheets: https://docs.google.com/spreadsheets/d/([a-zA-Z0-9_-]+)
  const sheetMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const fileId = sheetMatch[1];
    return {
      rawUrl: trimmed,
      previewUrl: `https://docs.google.com/spreadsheets/d/${fileId}/preview`,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`,
      isGoogleDoc: true,
      fileId,
    };
  }

  // 3. Google Presentations: https://docs.google.com/presentation/d/([a-zA-Z0-9_-]+)
  const presMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch && presMatch[1]) {
    const fileId = presMatch[1];
    return {
      rawUrl: trimmed,
      previewUrl: `https://docs.google.com/presentation/d/${fileId}/preview`,
      downloadUrl: `https://docs.google.com/presentation/d/${fileId}/export?format=pdf`,
      isGoogleDoc: true,
      fileId,
    };
  }

  // 4. Google Drive files:
  // e.g. drive.google.com/file/d/([a-zA-Z0-9_-]+)
  // or drive.google.com/open?id=([a-zA-Z0-9_-]+)
  // or drive.google.com/uc?id=([a-zA-Z0-9_-]+)
  let fileId: string | null = null;
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    fileId = fileMatch[1];
  } else {
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    return {
      rawUrl: trimmed,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isGoogleDoc: false,
      fileId,
    };
  }

  // Fallback for direct links
  return {
    rawUrl: trimmed,
    previewUrl: trimmed,
    downloadUrl: trimmed,
    isGoogleDoc: false,
    fileId: null,
  };
}
