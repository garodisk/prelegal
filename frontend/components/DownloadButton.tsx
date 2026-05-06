'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface DownloadButtonProps {
  templateName: string | null;
  markdownContent: string | null;
  isLoading: boolean;
}

export default function DownloadButton({
  templateName,
  markdownContent,
  isLoading,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!markdownContent || !templateName) return;

    setIsDownloading(true);
    try {
      // Convert markdown to HTML
      const htmlContent = await marked(markdownContent);

      // Create a temporary element for printing
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${templateName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 8.5in;
              margin: 0.5in;
              font-size: 11pt;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #000;
              margin-top: 1em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            p {
              margin: 0.5em 0;
              text-align: justify;
            }
            ul, ol {
              margin: 0.5em 0;
              padding-left: 1.5em;
            }
            li {
              margin: 0.25em 0;
            }
            strong {
              font-weight: 600;
            }
            em {
              font-style: italic;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      printWindow.document.close();

      // Trigger print dialog
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('Error during PDF generation:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isDisabled = !markdownContent || !templateName || isLoading || isDownloading;

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isDisabled}
      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
            />
          </svg>
          Download as PDF
        </>
      )}
    </button>
  );
}
