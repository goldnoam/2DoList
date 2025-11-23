import React, { useState, useEffect } from 'react';
import { Task, TranslationKey, Translations, Language } from '../types';
import { FLAG_COLORS } from '../constants';
import { X } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'order'> & { id?: string }) => void;
  initialData?: Task;
  translations: Translations;
  language: Language;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, initialData, translations, language }) => {
  const t = translations[language];
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [flagColor, setFlagColor] = useState(FLAG_COLORS[7]);

  useEffect(() => {
    if (isOpen && initialData) {
      setSubject(initialData.subject);
      setDescription(initialData.description);
      setDueDate(initialData.dueDate);
      setFlagColor(initialData.flagColor);
    } else if (isOpen) {
      // Reset
      setSubject('');
      setDescription('');
      setDueDate('');
      setFlagColor(FLAG_COLORS[7]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: any = {
      subject,
      description,
      dueDate,
      flagColor,
    };
    
    // Only attach ID if it exists (edit mode)
    if (initialData?.id) {
      taskData.id = initialData.id;
    }

    onSave(taskData);
    onClose();
  };

  const isRTL = language === Language.HE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {initialData ? t.editTask : t.addTask}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.subject}</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.dueDate}</label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.flag}</label>
            <div className="flex flex-wrap gap-2">
              {FLAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFlagColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${flagColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary hover:bg-indigo-600 rounded-lg shadow-lg hover:shadow-primary/50 transition-all"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};