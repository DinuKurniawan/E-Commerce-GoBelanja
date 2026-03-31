import { usePage } from '@inertiajs/react';

/**
 * Developer helper component to show translation status
 * Only visible in development mode
 * Shows current locale and missing translation warnings
 */
export default function TranslationDebugger() {
    const { locale, locales, translations } = usePage().props;
    
    // Only show in development
    if (import.meta.env.PROD) {
        return null;
    }

    const countKeys = (obj) => {
        let count = 0;
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                count += countKeys(obj[key]);
            } else {
                count++;
            }
        }
        return count;
    };

    const translationStats = {};
    for (const section in translations) {
        translationStats[section] = countKeys(translations[section]);
    }

    const totalKeys = Object.values(translationStats).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border-2 border-indigo-500 bg-white p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                    🌍 Translation Debugger
                </h3>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                    DEV
                </span>
            </div>
            
            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="text-slate-600">Current Locale:</span>
                    <span className="font-bold text-slate-900">{locale.toUpperCase()}</span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="text-slate-600">Available:</span>
                    <span className="font-semibold text-slate-900">
                        {locales?.join(', ').toUpperCase()}
                    </span>
                </div>

                <div className="rounded-lg bg-indigo-50 p-2">
                    <p className="mb-1 font-semibold text-indigo-900">Translation Stats:</p>
                    <div className="space-y-1">
                        {Object.entries(translationStats).map(([section, count]) => (
                            <div key={section} className="flex justify-between text-indigo-700">
                                <span>{section}:</span>
                                <span className="font-mono">{count} keys</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-indigo-200 pt-1 font-bold text-indigo-900">
                            <span>Total:</span>
                            <span className="font-mono">{totalKeys} keys</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-green-50 p-2">
                    <p className="text-green-800">
                        ✅ Translation system active
                    </p>
                </div>
            </div>

            <div className="mt-3 space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-500">
                <p>💡 Check console for missing keys</p>
                <p>📝 Use: t('section.key')</p>
                <p>💰 Format: formatCurrency(amount)</p>
            </div>
        </div>
    );
}
