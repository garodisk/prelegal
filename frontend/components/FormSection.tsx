'use client';

import { useForm } from 'react-hook-form';
import { TemplateField } from '@/lib/fieldParser';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface FormSectionProps {
  fields: TemplateField[];
  onFormChange: (values: Record<string, string>) => void;
  isLoading: boolean;
}

export default function FormSection({ fields, onFormChange, isLoading }: FormSectionProps) {
  const { register, watch } = useForm<Record<string, string>>();
  const formValues = watch();

  useEffect(() => {
    onFormChange(formValues);
  }, [formValues, onFormChange]);

  if (fields.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
        <p className="text-gray-600">Select a template to see the required fields.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Fill in the Details</h2>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {field.label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            {...register(field.key, { required: true })}
            type="text"
            placeholder={field.placeholder}
            disabled={isLoading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      ))}
    </div>
  );
}
