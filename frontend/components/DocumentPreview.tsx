'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface Props {
  formValues: Record<string, string>;
  templateText: string;
  isLoading: boolean;
}

function fmtDate(d: string): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Empty({ text }: { text: string }) {
  return <span className="text-amber-500 italic font-normal">[{text}]</span>;
}

function Val({ value, placeholder }: { value?: string; placeholder: string }) {
  if (value?.trim()) return <span className="text-gray-900">{value}</span>;
  return <Empty text={placeholder} />;
}

function CoverField({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
  return (
    <div>
      <p className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm leading-snug"><Val value={value} placeholder={placeholder} /></p>
    </div>
  );
}

// Replace any <span ...>innerText</span> with replacement string
function replaceSpan(text: string, innerText: string, replacement: string): string {
  const escaped = innerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`<span[^>]*>${escaped}<\\/span>`, 'gi'), replacement);
}

function fill(value: string, placeholder: string): string {
  return value
    ? `<strong style="color:#1e293b">${value}</strong>`
    : `<em style="color:#d97706;font-style:italic">[${placeholder}]</em>`;
}

function buildTemplateHtml(templateText: string, fv: Record<string, string>): string {
  const docType = fv.document_type || '';
  const effectiveDate = fv.effective_date ? fmtDate(fv.effective_date) : '';
  let t = templateText;

  if (docType === 'Mutual-NDA') {
    const mndaTerm = fv.mnda_term_years
      ? `${fv.mnda_term_years} year${fv.mnda_term_years === '1' ? '' : 's'} from Effective Date`
      : '';
    t = replaceSpan(t, 'Purpose', fill(fv.purpose || '', 'Purpose'));
    t = replaceSpan(t, 'Effective Date', fill(effectiveDate, 'Effective Date'));
    t = replaceSpan(t, 'MNDA Term', fill(mndaTerm, 'MNDA Duration'));
    t = replaceSpan(t, 'Term of Confidentiality', fill(mndaTerm, 'Confidentiality Period'));
    t = replaceSpan(t, 'Governing Law', fill(fv.governing_law || '', 'Governing State'));
    t = replaceSpan(t, 'Jurisdiction', fill(fv.jurisdiction || '', 'Jurisdiction'));
    return t;
  }

  const customer = fv.customer_name || '';
  const provider = fv.provider_name || '';
  t = replaceSpan(t, 'Customer', fill(customer, 'Customer'));
  t = replaceSpan(t, "Customer's", fill(customer ? `${customer}'s` : '', "Customer's"));
  t = replaceSpan(t, 'Provider', fill(provider, 'Provider'));
  t = replaceSpan(t, "Provider's", fill(provider ? `${provider}'s` : '', "Provider's"));
  t = replaceSpan(t, 'Partner', fill(customer, 'Partner'));
  t = replaceSpan(t, "Partner's", fill(customer ? `${customer}'s` : '', "Partner's"));
  t = replaceSpan(t, 'Effective Date', fill(effectiveDate, 'Effective Date'));
  t = replaceSpan(t, 'Governing Law', fill(fv.governing_law || '', 'Governing State'));
  t = replaceSpan(t, 'Chosen Courts', fill(fv.jurisdiction || '', 'Jurisdiction'));
  t = replaceSpan(t, 'Jurisdiction', fill(fv.jurisdiction || '', 'Jurisdiction'));

  if (fv.subscription_period) {
    t = replaceSpan(t, 'Subscription Period', fill(fv.subscription_period, 'Subscription Period'));
    t = replaceSpan(t, 'Subscription Periods', fill(fv.subscription_period, 'Subscription Period'));
  }
  if (fv.pilot_period) t = replaceSpan(t, 'Pilot Period', fill(fv.pilot_period, 'Pilot Period'));
  if (fv.general_cap_amount) t = replaceSpan(t, 'General Cap Amount', fill(fv.general_cap_amount, 'Liability Cap'));
  if (fv.uptime_target) t = replaceSpan(t, 'Uptime Target', fill(fv.uptime_target, 'Uptime %'));

  return t;
}

function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2 px-5 py-2.5 bg-[#ecad0a]/10 border-b border-[#ecad0a] text-[#032147] font-sans">
      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#ecad0a]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-[10px] leading-relaxed">
        <strong>Draft only.</strong> This document is AI-generated from a template and has not been reviewed by a licensed attorney. Do not use as legal advice.
      </p>
    </div>
  );
}

// ---- NDA-specific cover page ----

function NDABody({ fv, termsHtml }: { fv: Record<string, string>; termsHtml: string }) {
  const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const mndaTermYears = fv.mnda_term_years?.trim() || '';
  const mndaTermDisplay = mndaTermYears
    ? `Expires in ${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date`
    : '';

  const sigRows = [
    { label: 'Print Name', p1: 'party1_name', p2: 'party2_name' },
    { label: 'Title', p1: 'party1_title', p2: 'party2_title' },
    { label: 'Company', p1: 'party1_company', p2: 'party2_company' },
    { label: 'Email', p1: 'party1_email', p2: 'party2_email' },
  ];

  return (
    <>
      <DisclaimerBanner />
      <div className="px-10 py-8 bg-slate-50 border-b-2 border-slate-200">
        <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Cover Page</p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-8">
          <div className="col-span-2">
            <CoverField label="Purpose" value={fv.purpose} placeholder="How Confidential Information may be used" />
          </div>
          <CoverField label="Effective Date" value={effectiveDateFmt} placeholder="Agreement start date" />
          <CoverField label="MNDA Term" value={mndaTermDisplay} placeholder="Agreement duration" />
          <CoverField label="Governing Law" value={fv.governing_law} placeholder="State" />
          <CoverField label="Jurisdiction" value={fv.jurisdiction} placeholder="City / County, State" />
        </div>
        <div className="border-t border-slate-200 mb-6" />
        <p className="text-[11px] font-sans text-slate-500 italic mb-5 leading-relaxed">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-left text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 w-28" />
              <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Party 1</th>
              <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Party 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-5 text-[10px] font-sans text-slate-500 bg-slate-50">Signature</td>
              <td className="border border-slate-300 px-3 py-5" />
              <td className="border border-slate-300 px-3 py-5" />
            </tr>
            {sigRows.map(({ label, p1, p2 }) => (
              <tr key={label}>
                <td className="border border-slate-300 px-3 py-2.5 text-[10px] font-sans text-slate-500 bg-slate-50">{label}</td>
                <td className="border border-slate-300 px-3 py-2.5 text-center"><Val value={fv[p1]} placeholder={label} /></td>
                <td className="border border-slate-300 px-3 py-2.5 text-center"><Val value={fv[p2]} placeholder={label} /></td>
              </tr>
            ))}
            <tr>
              <td className="border border-slate-300 px-3 py-2.5 text-[10px] font-sans text-slate-500 bg-slate-50">Date</td>
              <td className="border border-slate-300 px-3 py-2.5 text-center text-sm">{effectiveDateFmt || <span className="text-slate-300">—</span>}</td>
              <td className="border border-slate-300 px-3 py-2.5 text-center" />
            </tr>
          </tbody>
        </table>
      </div>
      <TermsSection html={termsHtml} />
    </>
  );
}

// ---- Generic cover page ----

const DOC_COVER_FIELDS: Record<string, Array<{ label: string; key: string; placeholder: string; wide?: boolean }>> = {
  'CSA': [
    { label: 'Customer', key: 'customer_name', placeholder: 'Customer company' },
    { label: 'Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Subscription Period', key: 'subscription_period', placeholder: '1 year' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'Pilot-Agreement': [
    { label: 'Customer', key: 'customer_name', placeholder: 'Customer company' },
    { label: 'Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Pilot Period', key: 'pilot_period', placeholder: '30 days' },
    { label: 'Liability Cap', key: 'general_cap_amount', placeholder: '$10,000' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'psa': [
    { label: 'Client', key: 'customer_name', placeholder: 'Client company' },
    { label: 'Service Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Services', key: 'services_description', placeholder: 'Description of services', wide: true },
    { label: 'Payment Terms', key: 'payment_terms', placeholder: 'Net 30' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'design-partner-agreement': [
    { label: 'Design Partner', key: 'customer_name', placeholder: 'Partner company' },
    { label: 'Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'sla': [
    { label: 'Customer', key: 'customer_name', placeholder: 'Customer company' },
    { label: 'Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Uptime Target', key: 'uptime_target', placeholder: '99.9%' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'Software-License-Agreement': [
    { label: 'Licensee', key: 'customer_name', placeholder: 'Customer company' },
    { label: 'Licensor', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
  'DPA': [
    { label: 'Data Controller', key: 'customer_name', placeholder: 'Controller company' },
    { label: 'Data Processor', key: 'provider_name', placeholder: 'Processor company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
  ],
  'BAA': [
    { label: 'Covered Entity', key: 'customer_name', placeholder: 'Covered entity' },
    { label: 'Business Associate', key: 'provider_name', placeholder: 'Business associate' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
  ],
  'AI-Addendum': [
    { label: 'Customer', key: 'customer_name', placeholder: 'Customer company' },
    { label: 'Provider', key: 'provider_name', placeholder: 'Provider company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
  ],
  'Partnership-Agreement': [
    { label: 'Partner 1', key: 'customer_name', placeholder: 'First partner company' },
    { label: 'Partner 2', key: 'provider_name', placeholder: 'Second partner company' },
    { label: 'Effective Date', key: 'effective_date', placeholder: 'Agreement start date' },
    { label: 'Governing Law', key: 'governing_law', placeholder: 'State' },
    { label: 'Jurisdiction', key: 'jurisdiction', placeholder: 'City, State' },
  ],
};

function TermsSection({ html }: { html: string }) {
  return (
    <div className="px-10 py-8">
      <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 pb-3 border-b border-slate-200">Standard Terms</p>
      <div
        className="prose prose-sm max-w-none text-gray-800 leading-7 prose-headings:font-sans prose-headings:text-slate-700 prose-strong:text-slate-900"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-10 pt-5 border-t border-slate-100 text-center">
        <p className="text-[10px] font-sans text-slate-400">Common Paper · CC BY 4.0 · AI-generated from template — not legal advice</p>
      </div>
    </div>
  );
}

function GenericBody({ fv, termsHtml, docType }: { fv: Record<string, string>; termsHtml: string; docType: string }) {
  const fields = DOC_COVER_FIELDS[docType] || [];
  const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const getValue = (key: string) => key === 'effective_date' ? effectiveDateFmt : fv[key];

  return (
    <>
      <DisclaimerBanner />
      <div className="px-10 py-8 bg-slate-50 border-b-2 border-slate-200">
        <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Key Terms</p>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          {fields.map(f => (
            <div key={f.key} className={f.wide ? 'col-span-2' : ''}>
              <CoverField label={f.label} value={getValue(f.key)} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
      </div>
      <TermsSection html={termsHtml} />
    </>
  );
}

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

export default function DocumentPreview({ formValues: fv, templateText, isLoading }: Props) {
  const [termsHtml, setTermsHtml] = useState('');
  const docType = fv.document_type || '';
  const docName = DOC_NAMES[docType] || 'Legal Agreement';

  useEffect(() => {
    if (!templateText) return;
    const filled = buildTemplateHtml(templateText, fv);
    Promise.resolve(marked.parse(filled)).then(html => setTermsHtml(html));
  }, [templateText, fv]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-7 w-7 border-2 border-[#209dd7] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!docType) {
    return (
      <div className="max-w-[760px] mx-auto">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          <div className="bg-[#032147] text-white px-10 py-7 text-center">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-slate-400 mb-2">Common Paper</p>
            <h1 className="text-base font-bold tracking-[0.12em] uppercase text-white">Legal Agreement Creator</h1>
          </div>
          <div className="px-10 py-16 text-center text-slate-400">
            <p className="text-sm">Tell the AI assistant what type of document you need to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="bg-white shadow-2xl rounded-lg overflow-hidden" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <div className="bg-[#032147] text-white px-10 py-7 text-center">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-slate-400 mb-2">Common Paper</p>
          <h1 className="text-base font-bold tracking-[0.12em] uppercase text-white">{docName}</h1>
          <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Standard Terms Version 1.0</p>
        </div>
        {docType === 'Mutual-NDA'
          ? <NDABody fv={fv} termsHtml={termsHtml} />
          : <GenericBody fv={fv} termsHtml={termsHtml} docType={docType} />
        }
      </div>
    </div>
  );
}
