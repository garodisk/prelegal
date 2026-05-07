'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatSection from '@/components/ChatSection';
import DocumentPreview from '@/components/DocumentPreview';
import DownloadButton from '@/components/DownloadButton';

const TEMPLATE_MAP: Record<string, string> = {
  'Mutual-NDA': '/templates/Mutual-NDA.md',
  'CSA': '/templates/CSA.md',
  'Pilot-Agreement': '/templates/Pilot-Agreement.md',
  'psa': '/templates/psa.md',
  'design-partner-agreement': '/templates/design-partner-agreement.md',
  'sla': '/templates/sla.md',
  'Software-License-Agreement': '/templates/Software-License-Agreement.md',
  'DPA': '/templates/DPA.md',
  'BAA': '/templates/BAA.md',
  'AI-Addendum': '/templates/AI-Addendum.md',
  'Partnership-Agreement': '/templates/Partnership-Agreement.md',
};

export default function Home() {
  const [templateText, setTemplateText] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const loadedDocType = useRef('');

  const docType = formValues.document_type || '';

  useEffect(() => {
    if (!docType || docType === loadedDocType.current) return;
    const path = TEMPLATE_MAP[docType];
    if (!path) return;
    setIsLoading(true);
    fetch(path)
      .then(r => r.text())
      .then(text => { setTemplateText(text); loadedDocType.current = docType; })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [docType]);

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
            <h1 className="text-sm font-semibold text-gray-900 leading-none">Legal Agreement Creator</h1>
            <p className="text-xs text-gray-400 mt-0.5">Common Paper Standard Terms</p>
          </div>
        </div>
        <DownloadButton formValues={formValues} standardTerms={templateText} isLoading={isLoading} />
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <ChatSection onFormChange={handleFormChange} />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto bg-slate-100 py-8 px-6">
          <DocumentPreview formValues={formValues} templateText={templateText} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
