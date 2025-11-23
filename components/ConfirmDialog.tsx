
import React from 'react';
import { TranslationKey, Translations, Language } from '../types';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  translations: Translations;
  language: Language;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  translations,
  language,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isRTL = language === Language.HE;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md transition-colors font-medium"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
