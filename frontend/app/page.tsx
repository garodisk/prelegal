'use client';

import { useState, useCallback, useEffect } from 'react';
import ChatSection from '@/components/ChatSection';
import NDAPreview from '@/components/NDAPreview';
import DownloadButton from '@/components/DownloadButton';

export default function Home() {
  const [standardTerms, setStandardTerms] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/templates/Mutual-NDA.md')
      .then(r => r.text())
      .then(text => { setStandardTerms(text); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleFormChange = useCallback((values: Record<string, string>) => {
    setFormValues(values);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-none">Mutual NDA Creator</h1>
            <p className="text-xs text-gray-400 mt-0.5">Common Paper Standard Terms v1.0</p>
          </div>
        </div>
        <DownloadButton formValues={formValues} standardTerms={standardTerms} isLoading={isLoading} />
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <ChatSection onFormChange={handleFormChange} />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto bg-slate-100 py-8 px-6">
          <NDAPreview formValues={formValues} standardTerms={standardTerms} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
