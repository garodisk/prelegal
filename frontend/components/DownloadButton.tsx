'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface Props {
  formValues: Record<string, string>;
  standardTerms: string;
  isLoading: boolean;
}

function fmtDate(d: string): string {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function buildTermsHtml(standardTerms: string, fv: Record<string, string>): string {
  const purpose = fv.purpose?.trim() || '';
  const effectiveDate = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const mndaTermYears = fv.mnda_term_years?.trim() || '';
  const mndaTerm = mndaTermYears
    ? `${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date`
    : '';
  const govLaw = fv.governing_law?.trim() || '';
  const jurisdiction = fv.jurisdiction?.trim() || '';

  const fill = (value: string, placeholder: string) =>
    value ? `<strong>${value}</strong>` : `<em>[${placeholder}]</em>`;

  let filled = standardTerms;
  filled = filled.replace(/<span\s+class="coverpage_link">Purpose<\/span>/gi, fill(purpose, 'Purpose'));
  filled = filled.replace(/<span\s+class="coverpage_link">Effective Date<\/span>/gi, fill(effectiveDate, 'Effective Date'));
  filled = filled.replace(/<span\s+class="coverpage_link">MNDA Term<\/span>/gi, fill(mndaTerm, 'MNDA Duration'));
  filled = filled.replace(/<span\s+class="coverpage_link">Term of Confidentiality<\/span>/gi, fill(mndaTerm, 'Confidentiality Period'));
  filled = filled.replace(/<span\s+class="coverpage_link">Governing Law<\/span>/gi, fill(govLaw, 'Governing State'));
  filled = filled.replace(/<span\s+class="coverpage_link">Jurisdiction<\/span>/gi, fill(jurisdiction, 'Jurisdiction'));

  return filled;
}

function tableRow(label: string, p1: string, p2: string) {
  return `
    <tr>
      <td style="border:1px solid #cbd5e1;padding:8px 12px;font-size:10px;color:#64748b;background:#f8fafc;width:100px;">${label}</td>
      <td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${p1 || '<span style="color:#94a3b8">—</span>'}</td>
      <td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${p2 || '<span style="color:#94a3b8">—</span>'}</td>
    </tr>`;
}

export default function DownloadButton({ formValues: fv, standardTerms, isLoading }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = async () => {
    if (!standardTerms) return;
    setIsDownloading(true);

    try {
      const filledTerms = buildTermsHtml(standardTerms, fv);
      const termsHtml = await Promise.resolve(marked.parse(filledTerms));

      const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
      const mndaTermYears = fv.mnda_term_years?.trim() || '';
      const mndaTermDisplay = mndaTermYears
        ? `Expires in ${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date`
        : '—';

      const printWindow = window.open('', '', 'width=900,height=700');
      if (!printWindow) return;

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mutual Non-Disclosure Agreement</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; color: #1e293b; background: white; }
    .header { background: #1e293b; color: white; text-align: center; padding: 32px 40px; }
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
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <p class="eyebrow">Common Paper</p>
    <h1>Mutual Non-Disclosure Agreement</h1>
    <p class="sub">Standard Terms Version 1.0</p>
  </div>

  <div class="cover">
    <p class="section-label">Cover Page</p>
    <div class="terms-grid">
      <div style="grid-column:1/3">
        <p class="field-label">Purpose</p>
        <p class="field-value ${fv.purpose?.trim() ? '' : 'empty'}">${fv.purpose?.trim() || '[Purpose]'}</p>
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
        <p class="field-value ${fv.governing_law?.trim() ? '' : 'empty'}">${fv.governing_law?.trim() || '[State]'}</p>
      </div>
      <div>
        <p class="field-label">Jurisdiction</p>
        <p class="field-value ${fv.jurisdiction?.trim() ? '' : 'empty'}">${fv.jurisdiction?.trim() || '[City/County, State]'}</p>
      </div>
    </div>

    <hr class="divider">

    <p class="sign-note">By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>
    <table>
      <thead>
        <tr>
          <th style="text-align:left;width:100px;"></th>
          <th>Party 1</th>
          <th>Party 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family:Arial;font-size:10px;color:#64748b;background:#f8fafc;">Signature</td>
          <td style="height:48px;"></td>
          <td style="height:48px;"></td>
        </tr>
        ${tableRow('Print Name', fv.party1_name || '', fv.party2_name || '')}
        ${tableRow('Title', fv.party1_title || '', fv.party2_title || '')}
        ${tableRow('Company', fv.party1_company || '', fv.party2_company || '')}
        ${tableRow('Email', fv.party1_email || '', fv.party2_email || '')}
        ${tableRow('Date', effectiveDateFmt, '')}
      </tbody>
    </table>
  </div>

  <div class="terms">
    <p class="section-label">Standard Terms</p>
    ${termsHtml}
  </div>

  <div class="footer">
    Common Paper Mutual Non-Disclosure Agreement Version 1.0 · Free to use under CC BY 4.0
  </div>
</body>
</html>`);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading || isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
