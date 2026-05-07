'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatSection from '@/components/ChatSection';
import DocumentPreview from '@/components/DocumentPreview';
import DownloadButton from '@/components/DownloadButton';
import AuthModal from '@/components/AuthModal';
import DocumentHistoryModal from '@/components/DocumentHistoryModal';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

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

const DOC_NAMES: Record<string, string> = {
  'Mutual-NDA': 'Mutual Non-Disclosure Agreement',
  'CSA': 'Cloud Service Agreement',
  'Pilot-Agreement': 'Pilot Agreement',
  'psa': 'Professional Services Agreement',
  'design-partner-agreement': 'Design Partner Agreement',
  'sla': 'Service Level Agreement',
  'Software-License-Agreement': 'Software License Agreement',
  'DPA': 'Data Processing Agreement',
  'BAA': 'Business Associate Agreement',
  'AI-Addendum': 'AI Addendum',
  'Partnership-Agreement': 'Partnership Agreement',
};

export default function Home() {
  const { user, isLoading, signout } = useAuth();
  const [templateText, setTemplateText] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const loadedDocType = useRef('');

  const docType = formValues.document_type || '';

  useEffect(() => {
    if (!docType || docType === loadedDocType.current) return;
    const path = TEMPLATE_MAP[docType];
    if (!path) return;
    setIsTemplateLoading(true);
    fetch(path)
      .then(r => r.text())
      .then(text => { setTemplateText(text); loadedDocType.current = docType; })
      .catch(() => {})
      .finally(() => setIsTemplateLoading(false));
  }, [docType]);

  const handleFormChange = useCallback((values: Record<string, string>) => {
    setFormValues(values);
  }, []);

  async function saveDocument() {
    if (!user || !docType) return;
    const title = DOC_NAMES[docType] ?? 'Legal Agreement';
    try {
      const res = await fetch(`${API}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ title, document_type: docType, content: JSON.stringify(formValues) }),
      });
      if (res.status === 401) signout();
    } catch {
      // fire-and-forget — network failures silently ignored
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#209dd7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthModal isOpen={true} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#032147] border-b border-[#032147]/80 px-5 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#209dd7] rounded flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">Legal Agreement Creator</h1>
            <p className="text-xs text-[#209dd7] mt-0.5">Common Paper Standard Terms</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DownloadButton formValues={formValues} standardTerms={templateText} isLoading={isTemplateLoading} onSave={saveDocument} />
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors"
          >
            My Documents
          </button>
          <span className="text-xs text-white/50 px-1 hidden sm:block">{user.email}</span>
          <button
            onClick={signout}
            className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <ChatSection onFormChange={handleFormChange} />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto bg-slate-100 py-8 px-6">
          <DocumentPreview formValues={formValues} templateText={templateText} isLoading={isTemplateLoading} />
        </div>
      </div>

      {showHistory && user && (
        <DocumentHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} token={user.token} />
      )}
    </div>
  );
}
