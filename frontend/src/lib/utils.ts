import i18n from "@/i18n";
import { formatDistanceToNow } from "date-fns";
import { enUS, sv, nb } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

const getDateLocale = (language: string) => {
    switch (language) {
        case "sv":
            return sv;
        case "no":
            return nb;
        default:
            return enUS;
    }
};

export const formatRelativeTime = (
    date: Date | string,
    language: string = i18n.language
) => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getDateLocale(language),
    });
};

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
