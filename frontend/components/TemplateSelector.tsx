'use client';

import { Template } from '@/lib/templates';

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Select Agreement Template
      </label>
      <select
        value={selectedTemplate?.name || ''}
        onChange={(e) => {
          const template = templates.find((t) => t.name === e.target.value);
          if (template) {
            onSelectTemplate(template);
          }
        }}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 transition-colors"
      >
        <option value="">-- Choose a template --</option>
        {templates.map((template) => (
          <option key={template.name} value={template.name}>
            {template.name}
          </option>
        ))}
      </select>
      {selectedTemplate && (
        <p className="text-sm text-gray-600 mt-2">{selectedTemplate.description}</p>
      )}
    </div>
  );
}
