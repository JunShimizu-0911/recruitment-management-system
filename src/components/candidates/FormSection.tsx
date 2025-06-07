import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-white overflow-hidden border border-gray-200 rounded-md shadow-sm">
      <div className="px-4 py-3 bg-primary border-b border-gray-200">
        <h3 className="text-md font-medium text-white">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
};