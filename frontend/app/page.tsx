'use client';

import { useEffect, useState, useCallback } from 'react';
import { loadCatalog, loadTemplate, Template } from '@/lib/templates';
import { extractFields, fillTemplate, TemplateField } from '@/lib/fieldParser';
import TemplateSelector from '@/components/TemplateSelector';
import FormSection from '@/components/FormSection';
import PreviewSection from '@/components/PreviewSection';
import DownloadButton from '@/components/DownloadButton';

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [filledContent, setFilledContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load catalog on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const catalog = await loadCatalog();
        setTemplates(catalog.templates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load template content when template is selected
  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateContent(null);
      setFields([]);
      setFormValues({});
      setFilledContent(null);
      return;
    }

    const loadTemplateContent = async () => {
      setIsLoading(true);
      try {
        const content = await loadTemplate(selectedTemplate.filename);
        setTemplateContent(content);
        const extractedFields = extractFields(content);
        setFields(extractedFields);
        setFormValues({});
      } catch (error) {
        console.error('Failed to load template content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplateContent();
  }, [selectedTemplate]);

  // Update filled content when form values change
  useEffect(() => {
    if (templateContent && Object.keys(formValues).length > 0) {
      const filled = fillTemplate(templateContent, formValues);
      setFilledContent(filled);
    } else {
      setFilledContent(templateContent);
    }
  }, [formValues, templateContent]);

  const handleFormChange = useCallback((values: Record<string, string>) => {
    setFormValues(values);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Legal Document Creator
          </h1>
          <p className="text-gray-600">
            Create customized legal agreements from Common Paper templates
          </p>
        </div>

        {/* Template Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        </div>

        {selectedTemplate && (
          <>
            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column: Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <FormSection
                  fields={fields}
                  onFormChange={handleFormChange}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Column: Preview */}
              <div className="h-96 lg:h-auto">
                <PreviewSection
                  markdownContent={filledContent}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Download Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <DownloadButton
                templateName={selectedTemplate.name}
                markdownContent={filledContent}
                isLoading={isLoading}
              />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            All templates are sourced from{' '}
            <a
              href="https://github.com/CommonPaper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Common Paper
            </a>
            {' '}and licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              CC BY 4.0
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
