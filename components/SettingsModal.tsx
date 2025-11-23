import React, { useRef } from 'react';
import { AppSettings, Language, Theme, Translations } from '../types';
import { X, Upload, Monitor, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  translations: Translations;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, translations }) => {
  const t = translations[settings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({ ...settings, userLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isRTL = settings.language === Language.HE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t.settings}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Language */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">{t.language}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(Language).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onUpdateSettings({ ...settings, language: lang })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.language === lang
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">{t.theme}</h3>
            <div className="flex gap-4">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: Theme.DARK })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === Theme.DARK
                    ? 'bg-gray-900 text-white ring-2 ring-primary'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Moon size={18} /> Dark
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: Theme.LIGHT })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === Theme.LIGHT
                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Sun size={18} /> Light
              </button>
            </div>
          </section>

          {/* User Logo */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">{t.userLogo}</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                {settings.userLogo ? (
                  <img src={settings.userLogo} alt="User Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
              >
                <Upload size={18} /> {t.uploadLogo}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          </section>

          {/* About */}
          <section className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{t.about}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Version 1.0.0
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
              {t.copyright}
            </p>
            <a 
              href="mailto:gold.noam@gmail.com" 
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              gold.noam@gmail.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
