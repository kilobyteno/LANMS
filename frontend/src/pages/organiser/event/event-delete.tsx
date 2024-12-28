import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { eventsApi } from '@/lib/api/events';
import { route, RouteConfig } from '@/routes/route-config';
import { useEvent } from '@/context/EventContext';
import { Trash } from "@phosphor-icons/react";
import { Breadcrumb } from '@/components/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

export function EventDelete() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { refreshEvents } = useEvent();
    const breadcrumbs = useBreadcrumbs();

    useEffect(() => {
        async function loadEvent() {
            if (!id) return;

            try {
                const response = await eventsApi.get(id);
                setEvent(response.data.data);
            } catch (error) {
                console.error('Failed to load event:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadEvent();
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;
        
        setIsDeleting(true);
        try {
            await eventsApi.delete(id);
            await refreshEvents();
            navigate(route(RouteConfig.ORGANISER.ROOT));
        } catch (error) {
            console.error('Failed to delete event:', error);
        } finally {
            setIsDeleting(false);
            setShowConfirmDialog(false);
        }
    };

    if (isLoading) {
        return <div>{t('common.loading')}</div>;
    }

    if (!event) {
        return <div>{t('event.not_found')}</div>;
    }

    return (
        <div>
            <Breadcrumb items={breadcrumbs} />
            <div className="space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold tracking-tight">{t('event.delete.title')}</h2>
                    <p className="text-muted-foreground">
                        {t('event.delete.description')}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {new Date(event.start_at).toLocaleDateString()} - {new Date(event.end_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="rounded-md bg-destructive/10 p-4">
                        <div className="flex items-center gap-8 justify-center">
                            <div className="flex-1">
                                <h4 className="font-medium text-destructive">
                                    {t('event.delete.warning_title')}
                                </h4>
                                <p className="text-sm text-destructive/90">
                                    {t('event.delete.warning_description')}
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowConfirmDialog(true)}
                                    disabled={isDeleting}
                                    className="mt-4"
                                >
                                    <Trash className="h-6 w-6" />
                                    {isDeleting ? t('common.deleting') : t('common.delete')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('event.delete.confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('event.delete.confirm_description', { title: event.title })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                                {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? t('common.deleting') : t('event.delete.confirm_submit')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}