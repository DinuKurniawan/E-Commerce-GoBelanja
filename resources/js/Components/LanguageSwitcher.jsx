import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function LanguageSwitcher({ className = '' }) {
    const { locale, locales, localeNames } = usePage().props;
    const [isChanging, setIsChanging] = useState(false);

    const handleLocaleChange = async (newLocale) => {
        if (newLocale === locale || isChanging) return;

        setIsChanging(true);

        try {
            await axios.post('/locale', { locale: newLocale });
            
            // Reload the page to apply new locale
            router.reload({
                preserveScroll: true,
                onFinish: () => setIsChanging(false),
            });
        } catch (error) {
            console.error('Failed to change locale:', error);
            setIsChanging(false);
        }
    };

    const getFlag = (loc) => {
        const flags = {
            id: '🇮🇩',
            en: '🇬🇧',
        };
        return flags[loc] || '🌐';
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-2">
                {locales?.map((loc) => (
                    <button
                        key={loc}
                        onClick={() => handleLocaleChange(loc)}
                        disabled={isChanging}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${
                                locale === loc
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }
                            ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title={localeNames?.[loc] || loc.toUpperCase()}
                    >
                        <span className="text-lg">{getFlag(loc)}</span>
                        <span className="hidden sm:inline">{localeNames?.[loc] || loc.toUpperCase()}</span>
                    </button>
                ))}
            </div>
            
            {isChanging && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                </div>
            )}
        </div>
    );
}
