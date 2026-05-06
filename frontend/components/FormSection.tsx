'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface FormValues {
  party1_name: string;
  party1_title: string;
  party1_company: string;
  party1_email: string;
  party2_name: string;
  party2_title: string;
  party2_company: string;
  party2_email: string;
  purpose: string;
  effective_date: string;
  mnda_term_years: string;
  governing_law: string;
  jurisdiction: string;
}

interface Props {
  onFormChange: (values: Record<string, string>) => void;
}

const input = "w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const label = "block text-xs font-medium text-gray-600 mb-1";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function FormSection({ onFormChange }: Props) {
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      effective_date: new Date().toISOString().split('T')[0],
    },
  });

  const formValues = watch();
  useEffect(() => {
    onFormChange(formValues as unknown as Record<string, string>);
  }, [formValues, onFormChange]);

  return (
    <div>
      {/* Party 1 */}
      <SectionHeader title="Your Details" subtitle="First party" />
      <div className="px-5 py-4 space-y-3 border-b border-gray-100">
        <div>
          <label className={label}>Full Name</label>
          <input {...register('party1_name')} type="text" placeholder="Jane Smith" className={input} />
        </div>
        <div>
          <label className={label}>Title / Designation</label>
          <input {...register('party1_title')} type="text" placeholder="CEO, Director, VP Engineering…" className={input} />
        </div>
        <div>
          <label className={label}>Company</label>
          <input {...register('party1_company')} type="text" placeholder="Acme Corp" className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input {...register('party1_email')} type="email" placeholder="jane@acme.com" className={input} />
        </div>
      </div>

      {/* Party 2 */}
      <SectionHeader title="Counterparty" subtitle="Second party" />
      <div className="px-5 py-4 space-y-3 border-b border-gray-100">
        <div>
          <label className={label}>Full Name</label>
          <input {...register('party2_name')} type="text" placeholder="John Doe" className={input} />
        </div>
        <div>
          <label className={label}>Title / Designation</label>
          <input {...register('party2_title')} type="text" placeholder="CEO, Director, VP Engineering…" className={input} />
        </div>
        <div>
          <label className={label}>Company</label>
          <input {...register('party2_company')} type="text" placeholder="Beta Inc" className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input {...register('party2_email')} type="email" placeholder="john@beta.com" className={input} />
        </div>
      </div>

      {/* Agreement Terms */}
      <SectionHeader title="Agreement Terms" />
      <div className="px-5 py-4 space-y-3">
        <div>
          <label className={label}>Purpose</label>
          <textarea
            {...register('purpose')}
            placeholder="Evaluating whether to enter into a business relationship with the other party"
            className={`${input} resize-none`}
            rows={3}
          />
        </div>
        <div>
          <label className={label}>Effective Date</label>
          <input {...register('effective_date')} type="date" className={input} />
        </div>
        <div>
          <label className={label}>MNDA Term</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Expires in</span>
            <input
              {...register('mnda_term_years')}
              type="number"
              min="1"
              max="10"
              placeholder="1"
              className={`${input} w-20 text-center`}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">year(s) from Effective Date</span>
          </div>
        </div>
        <div>
          <label className={label}>Governing Law (State)</label>
          <input {...register('governing_law')} type="text" placeholder="California" className={input} />
        </div>
        <div>
          <label className={label}>Jurisdiction</label>
          <input {...register('jurisdiction')} type="text" placeholder="San Francisco, CA" className={input} />
        </div>
      </div>
    </div>
  );
}
