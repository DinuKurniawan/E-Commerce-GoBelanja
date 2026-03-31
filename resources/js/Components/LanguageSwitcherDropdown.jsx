import { Fragment, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function LanguageSwitcherDropdown({ className = '' }) {
    const { locale, locales, localeNames } = usePage().props;
    const [isChanging, setIsChanging] = useState(false);

    const handleLocaleChange = async (newLocale) => {
        if (newLocale === locale || isChanging) return;

        setIsChanging(true);

        try {
            await axios.post('/locale', { locale: newLocale });
            
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
        <Menu as="div" className={`relative ${className}`}>
            <Menu.Button
                disabled={isChanging}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
                <span className="text-lg">{getFlag(locale)}</span>
                <span className="hidden sm:inline">{localeNames?.[locale] || locale.toUpperCase()}</span>
                {isChanging ? (
                    <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                )}
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        {locales?.map((loc) => (
                            <Menu.Item key={loc}>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleLocaleChange(loc)}
                                        disabled={isChanging}
                                        className={`
                                            ${active ? 'bg-slate-100' : ''}
                                            ${locale === loc ? 'bg-slate-50 font-semibold' : ''}
                                            group flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <span className="text-lg">{getFlag(loc)}</span>
                                        <span>{localeNames?.[loc] || loc.toUpperCase()}</span>
                                        {locale === loc && (
                                            <span className="ml-auto text-slate-900">✓</span>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
