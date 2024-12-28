import i18n from '@/i18n';
import { formatDistanceToNow } from 'date-fns';
import { enUS, sv, nb } from 'date-fns/locale';

const getDateLocale = (language: string) => {
    switch (language) {
        case 'sv': return sv;
        case 'no': return nb;
        default: return enUS;
    }
};

export const formatRelativeTime = (date: Date | string, language: string = i18n.language) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getDateLocale(language)
    });
}; 