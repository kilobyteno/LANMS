import { useTranslation } from "react-i18next";
import { Spinner } from "./spinner";

export function LoadingScreen() {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="xl" />
                <p className="text-muted-foreground text-sm">{ t('common.loading') }</p>
            </div>
        </div>
    );
} 