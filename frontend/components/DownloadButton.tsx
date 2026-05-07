'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface Props {
  formValues: Record<string, string>;
  standardTerms: string;
  isLoading: boolean;
  onSave?: () => Promise<void>;
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

function fmtDate(d: string): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function replaceSpan(text: string, innerText: string, replacement: string): string {
  const escaped = innerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`<span[^>]*>${escaped}<\\/span>`, 'gi'), replacement);
}

function fill(value: string, placeholder: string): string {
  return value ? `<strong>${value}</strong>` : `<em>[${placeholder}]</em>`;
}

function buildTermsHtml(templateText: string, fv: Record<string, string>): string {
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

const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; color: #1e293b; background: white; }
  .header { background: #032147; color: white; text-align: center; padding: 32px 40px; }
  .header .eyebrow { font-family: Arial, sans-serif; font-size: 8pt; letter-spacing: 0.25em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
  .header h1 { font-size: 14pt; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; }
  .header .sub { font-family: Arial, sans-serif; font-size: 8pt; color: #94a3b8; margin-top: 6px; }
  .cover { padding: 32px 40px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
  .section-label { font-family: Arial, sans-serif; font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #94a3b8; margin-bottom: 20px; }
  .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; margin-bottom: 28px; }
  .field-label { font-family: Arial, sans-serif; font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 2px; }
  .field-value { font-size: 10pt; line-height: 1.4; color: #1e293b; }
  .field-value.empty { color: #d97706; font-style: italic; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  .sign-note { font-family: Arial, sans-serif; font-size: 9pt; color: #64748b; font-style: italic; margin-bottom: 16px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th { border: 1px solid #cbd5e1; padding: 8px 12px; background: #e2e8f0; font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
  td { border: 1px solid #cbd5e1; padding: 8px 12px; }
  .terms { padding: 32px 40px; }
  .terms h1 { font-size: 13pt; margin: 16px 0 8px; }
  .terms h2, .terms h3 { font-size: 11pt; margin: 14px 0 6px; }
  .terms p { margin: 6px 0; line-height: 1.7; text-align: justify; }
  .terms ul, .terms ol { margin: 6px 0; padding-left: 20px; }
  .terms li { margin: 3px 0; line-height: 1.6; }
  .footer { text-align: center; padding: 16px 40px; border-top: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 8pt; color: #94a3b8; }
  .disclaimer { border: 1px solid #ecad0a; background: #fdf8e7; color: #032147; font-family: Arial, sans-serif; font-size: 8pt; padding: 8px 40px; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

function buildNdaCoverHtml(fv: Record<string, string>): string {
  const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const mndaTermYears = fv.mnda_term_years?.trim() || '';
  const mndaTermDisplay = mndaTermYears
    ? `Expires in ${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date`
    : '—';
  const val = (v?: string, p?: string) => v?.trim() || `[${p}]`;
  const row = (label: string, p1: string, p2: string) =>
    `<tr>
      <td style="font-family:Arial;font-size:10px;color:#64748b;background:#f8fafc;">${label}</td>
      <td style="text-align:center;">${p1 || '<span style="color:#94a3b8">—</span>'}</td>
      <td style="text-align:center;">${p2 || '<span style="color:#94a3b8">—</span>'}</td>
    </tr>`;

  return `<div class="cover">
    <p class="section-label">Cover Page</p>
    <div class="terms-grid">
      <div style="grid-column:1/3">
        <p class="field-label">Purpose</p>
        <p class="field-value ${fv.purpose?.trim() ? '' : 'empty'}">${val(fv.purpose, 'Purpose')}</p>
      </div>
      <div>
        <p class="field-label">Effective Date</p>
        <p class="field-value ${effectiveDateFmt ? '' : 'empty'}">${effectiveDateFmt || '[Effective Date]'}</p>
      </div>
      <div>
        <p class="field-label">MNDA Term</p>
        <p class="field-value ${mndaTermYears ? '' : 'empty'}">${mndaTermDisplay}</p>
      </div>
      <div>
        <p class="field-label">Governing Law</p>
        <p class="field-value ${fv.governing_law?.trim() ? '' : 'empty'}">${val(fv.governing_law, 'State')}</p>
      </div>
      <div>
        <p class="field-label">Jurisdiction</p>
        <p class="field-value ${fv.jurisdiction?.trim() ? '' : 'empty'}">${val(fv.jurisdiction, 'City/County, State')}</p>
      </div>
    </div>
    <hr class="divider">
    <p class="sign-note">By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>
    <table>
      <thead><tr><th style="text-align:left;width:100px;"></th><th>Party 1</th><th>Party 2</th></tr></thead>
      <tbody>
        <tr><td style="font-family:Arial;font-size:10px;color:#64748b;background:#f8fafc;">Signature</td><td style="height:48px;"></td><td style="height:48px;"></td></tr>
        ${row('Print Name', fv.party1_name || '', fv.party2_name || '')}
        ${row('Title', fv.party1_title || '', fv.party2_title || '')}
        ${row('Company', fv.party1_company || '', fv.party2_company || '')}
        ${row('Email', fv.party1_email || '', fv.party2_email || '')}
        ${row('Date', effectiveDateFmt, '')}
      </tbody>
    </table>
  </div>`;
}

const GENERIC_COVER_FIELDS: Record<string, Array<{ label: string; key: string }>> = {
  'CSA': [{ label: 'Customer', key: 'customer_name' }, { label: 'Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Subscription Period', key: 'subscription_period' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'Pilot-Agreement': [{ label: 'Customer', key: 'customer_name' }, { label: 'Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Pilot Period', key: 'pilot_period' }, { label: 'Liability Cap', key: 'general_cap_amount' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'psa': [{ label: 'Client', key: 'customer_name' }, { label: 'Service Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Services', key: 'services_description' }, { label: 'Payment Terms', key: 'payment_terms' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'design-partner-agreement': [{ label: 'Design Partner', key: 'customer_name' }, { label: 'Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'sla': [{ label: 'Customer', key: 'customer_name' }, { label: 'Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Uptime Target', key: 'uptime_target' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'Software-License-Agreement': [{ label: 'Licensee', key: 'customer_name' }, { label: 'Licensor', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
  'DPA': [{ label: 'Data Controller', key: 'customer_name' }, { label: 'Data Processor', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }],
  'BAA': [{ label: 'Covered Entity', key: 'customer_name' }, { label: 'Business Associate', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }],
  'AI-Addendum': [{ label: 'Customer', key: 'customer_name' }, { label: 'Provider', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }],
  'Partnership-Agreement': [{ label: 'Partner 1', key: 'customer_name' }, { label: 'Partner 2', key: 'provider_name' }, { label: 'Effective Date', key: 'effective_date' }, { label: 'Governing Law', key: 'governing_law' }, { label: 'Jurisdiction', key: 'jurisdiction' }],
};

function buildGenericCoverHtml(fv: Record<string, string>, docType: string): string {
  const fields = GENERIC_COVER_FIELDS[docType] || [];
  const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const getValue = (key: string) => key === 'effective_date' ? effectiveDateFmt : (fv[key] || '');

  const rows = fields.map(f => {
    const v = getValue(f.key);
    return `<div>
      <p class="field-label">${f.label}</p>
      <p class="field-value ${v ? '' : 'empty'}">${v || `[${f.label}]`}</p>
    </div>`;
  }).join('');

  return `<div class="cover">
    <p class="section-label">Key Terms</p>
    <div class="terms-grid">${rows}</div>
  </div>`;
}

export default function DownloadButton({ formValues: fv, standardTerms, isLoading, onSave }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const docType = fv.document_type || '';
  const docName = DOC_NAMES[docType] || 'Legal Agreement';

  const handlePrint = async () => {
    if (!standardTerms || !docType) return;
    setIsDownloading(true);

    try {
      const filledTerms = buildTermsHtml(standardTerms, fv);
      const termsHtml = await Promise.resolve(marked.parse(filledTerms));
      const coverHtml = docType === 'Mutual-NDA' ? buildNdaCoverHtml(fv) : buildGenericCoverHtml(fv, docType);

      const printWindow = window.open('', '', 'width=900,height=700');
      if (!printWindow) return;

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docName}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  <div class="header">
    <p class="eyebrow">Common Paper</p>
    <h1>${docName}</h1>
    <p class="sub">Standard Terms Version 1.0</p>
  </div>
  <div class="disclaimer">AI-generated from a template. Not legal advice. Consult a licensed attorney before use.</div>
  ${coverHtml}
  <div class="terms">
    <p class="section-label">Standard Terms</p>
    ${termsHtml}
  </div>
  <div class="footer">Common Paper · Free to use under CC BY 4.0 · AI-generated from template — not legal advice</div>
</body>
</html>`);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); onSave?.(); }, 300);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading || isDownloading || !docType}
      className="flex items-center gap-2 px-4 py-2 bg-[#753991] text-white text-sm font-medium rounded-md hover:bg-[#6b3384] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preparing…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
}
