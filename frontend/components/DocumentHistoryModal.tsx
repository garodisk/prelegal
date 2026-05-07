'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

const DOC_NAMES: Record<string, string> = {
  'Mutual-NDA': 'Mutual NDA',
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

interface DocRecord {
  id: number;
  title: string;
  document_type: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose(): void;
  token: string;
}

export default function DocumentHistoryModal({ isOpen, onClose, token }: Props) {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`${API}/api/documents`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setDocs(Array.isArray(data) ? data : []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#032147] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-semibold text-sm">My Documents</h2>
            <p className="text-[#209dd7] text-xs mt-0.5">Previously generated agreements</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-[#209dd7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 px-6 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No documents yet</p>
              <p className="text-xs text-[#888888] mt-1">Documents are saved when you download them</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {docs.map(doc => (
                <li key={doc.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium text-[#032147] leading-tight">{doc.title}</p>
                  <p className="text-xs text-[#888888] mt-0.5">{DOC_NAMES[doc.document_type] ?? doc.document_type}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <p className="text-xs text-[#888888] text-center">Documents are stored until the server restarts</p>
        </div>
      </div>
    </div>
  );
}
