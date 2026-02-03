import { useCallback, useState, type RefObject } from 'react';
import { toPng } from 'html-to-image';

interface ExportButtonProps {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
}

// Lotus logo SVG paths for watermark
function LotusWatermark() {
  return (
    <svg viewBox="0 0 500 500" className="w-8 h-8">
      <path fill="#fbfafc" d="M170.32,425.13h0c0,5.61-4.55,10.16-10.16,10.16h-86.35c-5.61,0-10.16-4.55-10.16-10.16v-86.35c0-5.61,4.55-10.16,10.16-10.16,53.3,0,96.51,43.21,96.51,96.51Z"/>
      <path fill="#fbfafc" d="M121.77,256.97c3.45-3.45,3.45-9.04,0-12.49l-53.09-53.1c-3.45-3.45-9.04-3.45-12.49,0L3.09,244.48c-3.45,3.45-3.45,9.04,0,12.49l53.1,53.1c3.45,3.45,9.04,3.45,12.49,0l53.09-53.1Z"/>
      <path fill="#fbfafc" d="M160.17,64.71h-86.35c-5.61,0-10.16,4.55-10.16,10.16v86.35c0,5.61,4.55,10.16,10.16,10.16,53.3,0,96.51-43.21,96.51-96.51,0-5.61-4.55-10.16-10.16-10.16Z"/>
      <path fill="#fbfafc" d="M426.19,171.38c5.61,0,10.16-4.55,10.16-10.16v-86.35c0-5.61-4.55-10.16-10.16-10.16h-86.35c-5.61,0-10.16,4.55-10.16,10.16,0,53.3,43.21,96.51,96.51,96.51Z"/>
      <path fill="#fbfafc" d="M426.19,328.62c-53.3,0-96.51,43.21-96.51,96.51h0c0,5.61,4.55,10.16,10.16,10.16h86.35c5.61,0,10.16-4.55,10.16-10.16v-86.35c0-5.61-4.55-10.16-10.16-10.16Z"/>
      <path fill="#fbfafc" d="M496.91,244.48l-53.1-53.1c-3.45-3.45-9.04-3.45-12.49,0l-53.09,53.1c-3.45,3.45-3.45,9.04,0,12.49l53.09,53.1c3.45,3.45,9.04,3.45,12.49,0l53.1-53.1c3.45-3.45,3.45-9.04,0-12.49Z"/>
      <path fill="#fbfafc" d="M256.25,4.15c-3.45-3.45-9.04-3.45-12.49,0l-53.09,53.1c-3.45,3.45-3.45,9.04,0,12.49l53.09,53.1c3.45,3.45,9.04,3.45,12.49,0l53.1-53.1c3.45-3.45,3.45-9.04,0-12.49l-53.1-53.1Z"/>
      <path fill="#fbfafc" d="M256.25,377.17c-3.45-3.45-9.04-3.45-12.49,0l-53.09,53.1c-3.45,3.45-3.45,9.04,0,12.49l53.09,53.1c3.45,3.45,9.04,3.45,12.49,0l53.1-53.1c3.45-3.45,3.45-9.04,0-12.49l-53.1-53.1Z"/>
    </svg>
  );
}

export function ExportButton({ targetRef, filename = 'chart-export' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef.current || isExporting) return;

    setIsExporting(true);

    // Find elements to toggle during export
    const logo = targetRef.current.querySelector('.export-logo-watermark') as HTMLElement;
    const button = targetRef.current.querySelector('.export-button') as HTMLElement;

    // Show logo, hide button for the capture
    if (logo) logo.style.display = 'block';
    if (button) button.style.display = 'none';

    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: '#1a1625',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      // Restore visibility
      if (logo) logo.style.display = 'none';
      if (button) button.style.display = 'block';
      setIsExporting(false);
    }
  }, [targetRef, filename, isExporting]);

  return (
    <>
      {/* Logo watermark - hidden until export */}
      <div className="export-logo-watermark absolute top-3 right-3" style={{ display: 'none' }}>
        <LotusWatermark />
      </div>

      {/* Camera button - visible in UI, hidden during export */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="export-button absolute top-3 right-3 p-2 bg-lotus-grey-700 hover:bg-lotus-grey-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PNG"
      >
        {isExporting ? (
          <svg className="w-5 h-5 text-lotus-grey-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-lotus-grey-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        )}
      </button>
    </>
  );
}
