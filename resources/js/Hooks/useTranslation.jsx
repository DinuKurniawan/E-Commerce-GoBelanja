import { usePage } from '@inertiajs/react';

/**
 * Translation hook for accessing translations in React components
 * Usage: const { t, locale } = useTranslation();
 */
export function useTranslation() {
    const { translations, locale } = usePage().props;

    /**
     * Get translated text by key
     * @param {string} key - Translation key in format 'section.key' (e.g., 'general.home')
     * @param {object} params - Parameters to replace in translation (e.g., { count: 5 })
     * @returns {string} Translated text or key if not found
     */
    const t = (key, params = {}) => {
        // Split the key into section and nested keys
        const keys = key.split('.');
        
        if (keys.length < 2) {
            console.warn(`Translation key "${key}" should be in format "section.key"`);
            return key;
        }

        const [section, ...nestedKeys] = keys;
        let value = translations?.[section];

        // Navigate through nested keys
        for (const nestedKey of nestedKeys) {
            if (value && typeof value === 'object') {
                value = value[nestedKey];
            } else {
                break;
            }
        }

        // If translation not found, return the key
        if (value === undefined || value === null) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }

        // Replace parameters in the translation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/:(\w+)/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }

        return value;
    };

    /**
     * Get all translations for a section
     * @param {string} section - Section name (e.g., 'general', 'products')
     * @returns {object} All translations for the section
     */
    const getSection = (section) => {
        return translations?.[section] || {};
    };

    /**
     * Check if current locale matches
     * @param {string} checkLocale - Locale to check
     * @returns {boolean}
     */
    const isLocale = (checkLocale) => {
        return locale === checkLocale;
    };

    /**
     * Format number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    const formatCurrency = (amount) => {
        const currency = t('general.currency');
        const formatted = new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

        return locale === 'id' ? `${currency} ${formatted}` : `${currency}${formatted}`;
    };

    /**
     * Format date according to locale
     * @param {string|Date} date - Date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    const formatDate = (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        return new Intl.DateTimeFormat(
            locale === 'id' ? 'id-ID' : 'en-US',
            { ...defaultOptions, ...options }
        ).format(new Date(date));
    };

    return {
        t,
        locale,
        getSection,
        isLocale,
        formatCurrency,
        formatDate,
    };
}

export default useTranslation;
