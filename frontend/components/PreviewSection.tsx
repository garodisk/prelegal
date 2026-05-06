'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface PreviewSectionProps {
  markdownContent: string | null;
  isLoading: boolean;
}

export default function PreviewSection({ markdownContent, isLoading }: PreviewSectionProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (markdownContent) {
      marked(markdownContent).then((html) => {
        setHtmlContent(html);
      });
    }
  }, [markdownContent]);

  if (!markdownContent) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 h-full flex items-center justify-center">
        <p className="text-gray-600 text-center">
          Select a template and fill in the details to see a preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Document Preview</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
