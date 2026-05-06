'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface Props {
  formValues: Record<string, string>;
  standardTerms: string;
  isLoading: boolean;
}

function fmtDate(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function Empty({ text }: { text: string }) {
  return <span className="text-amber-500 italic font-normal">[{text}]</span>;
}

function Val({ value, placeholder }: { value?: string; placeholder: string }) {
  if (value && value.trim()) return <span className="text-gray-900">{value}</span>;
  return <Empty text={placeholder} />;
}

function CoverField({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
  return (
    <div>
      <p className="text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm leading-snug">
        <Val value={value} placeholder={placeholder} />
      </p>
    </div>
  );
}

function buildTermsHtml(standardTerms: string, fv: Record<string, string>): string {
  const purpose = fv.purpose?.trim() || '';
  const effectiveDate = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const mndaTermYears = fv.mnda_term_years?.trim() || '';
  const mndaTerm = mndaTermYears ? `${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date` : '';
  const govLaw = fv.governing_law?.trim() || '';
  const jurisdiction = fv.jurisdiction?.trim() || '';

  const fill = (value: string, placeholder: string) =>
    value
      ? `<strong style="color:#1e293b">${value}</strong>`
      : `<em style="color:#d97706;font-style:italic">[${placeholder}]</em>`;

  let filled = standardTerms;
  filled = filled.replace(/<span\s+class="coverpage_link">Purpose<\/span>/gi, fill(purpose, 'Purpose'));
  filled = filled.replace(/<span\s+class="coverpage_link">Effective Date<\/span>/gi, fill(effectiveDate, 'Effective Date'));
  filled = filled.replace(/<span\s+class="coverpage_link">MNDA Term<\/span>/gi, fill(mndaTerm, 'MNDA Duration'));
  filled = filled.replace(/<span\s+class="coverpage_link">Term of Confidentiality<\/span>/gi, fill(mndaTerm, 'Confidentiality Period'));
  filled = filled.replace(/<span\s+class="coverpage_link">Governing Law<\/span>/gi, fill(govLaw, 'Governing State'));
  filled = filled.replace(/<span\s+class="coverpage_link">Jurisdiction<\/span>/gi, fill(jurisdiction, 'Jurisdiction'));

  return filled;
}

export default function NDAPreview({ formValues: fv, standardTerms, isLoading }: Props) {
  const [termsHtml, setTermsHtml] = useState('');

  useEffect(() => {
    if (!standardTerms) return;
    const filled = buildTermsHtml(standardTerms, fv);
    Promise.resolve(marked.parse(filled)).then(html => setTermsHtml(html));
  }, [standardTerms, fv]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const effectiveDateFmt = fv.effective_date ? fmtDate(fv.effective_date) : '';
  const mndaTermYears = fv.mnda_term_years?.trim() || '';
  const mndaTermDisplay = mndaTermYears
    ? `Expires in ${mndaTermYears} year${mndaTermYears === '1' ? '' : 's'} from Effective Date`
    : '';

  return (
    <div className="max-w-[760px] mx-auto">
      <div
        className="bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {/* Header */}
        <div className="bg-slate-800 text-white px-10 py-7 text-center">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-slate-400 mb-2">Common Paper</p>
          <h1 className="text-base font-bold tracking-[0.12em] uppercase text-white">
            Mutual Non-Disclosure Agreement
          </h1>
          <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Standard Terms Version 1.0</p>
        </div>

        {/* Cover Page */}
        <div className="px-10 py-8 bg-slate-50 border-b-2 border-slate-200">
          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Cover Page</p>

          {/* Key terms grid */}
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

          {/* Signature block */}
          <p className="text-[11px] font-sans text-slate-500 italic mb-5 leading-relaxed">
            By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
          </p>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-left text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 w-28" />
                <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">
                  Party 1
                </th>
                <th className="border border-slate-300 px-3 py-2.5 bg-slate-200 text-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">
                  Party 2
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-5 text-[10px] font-sans text-slate-500 bg-slate-50">Signature</td>
                <td className="border border-slate-300 px-3 py-5" />
                <td className="border border-slate-300 px-3 py-5" />
              </tr>
              {[
                { rowLabel: 'Print Name', p1key: 'party1_name', p2key: 'party2_name', placeholder: 'Full Name' },
                { rowLabel: 'Title', p1key: 'party1_title', p2key: 'party2_title', placeholder: 'Title' },
                { rowLabel: 'Company', p1key: 'party1_company', p2key: 'party2_company', placeholder: 'Company' },
                { rowLabel: 'Email', p1key: 'party1_email', p2key: 'party2_email', placeholder: 'email@company.com' },
              ].map(({ rowLabel, p1key, p2key, placeholder }) => (
                <tr key={rowLabel}>
                  <td className="border border-slate-300 px-3 py-2.5 text-[10px] font-sans text-slate-500 bg-slate-50">
                    {rowLabel}
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <Val value={fv[p1key]} placeholder={placeholder} />
                  </td>
                  <td className="border border-slate-300 px-3 py-2.5 text-center">
                    <Val value={fv[p2key]} placeholder={placeholder} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-slate-300 px-3 py-2.5 text-[10px] font-sans text-slate-500 bg-slate-50">Date</td>
                <td className="border border-slate-300 px-3 py-2.5 text-center text-sm">
                  {effectiveDateFmt || <span className="text-slate-300">—</span>}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 text-center" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Standard Terms */}
        <div className="px-10 py-8">
          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 pb-3 border-b border-slate-200">
            Standard Terms
          </p>
          <div
            className="prose prose-sm max-w-none text-gray-800 leading-7 prose-headings:font-sans prose-headings:text-slate-700 prose-strong:text-slate-900"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            dangerouslySetInnerHTML={{ __html: termsHtml }}
          />
          <div className="mt-10 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] font-sans text-slate-400">
              Common Paper Mutual Non-Disclosure Agreement Version 1.0 · Free to use under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY 4.0
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
