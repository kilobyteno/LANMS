import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@/components/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import { route, RouteConfig } from '@/routes/route-config';
import { articlesApi } from '@/lib/api/event-articles';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Article } from '@/lib/api/event-articles';
import { DotsThree, Eye, PencilLine, Plus, Trash } from '@phosphor-icons/react';
import { useEvent } from '@/context/EventContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

export function ArticleList() {
    const { t } = useTranslation();
    const breadcrumbs = useBreadcrumbs();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const {currentEvent} = useEvent();

    useEffect(() => {
        const fetchArticles = async () => {
            if (!currentEvent?.id) return;

            try {
                const response = await articlesApi.list(currentEvent.id);
                setArticles(response.data.data);
            } catch (error) {
                console.error('Failed to fetch articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [currentEvent?.id]);

    const handleDelete = async () => {
        if (!currentEvent?.id || !articleToDelete?.id || isDeleting) return;

        setIsDeleting(true);
        try {
            await articlesApi.delete(currentEvent.id, articleToDelete.id);
            setArticles(articles.filter(article => article.id !== articleToDelete.id));
        } catch (error) {
            console.error('Failed to delete article:', error);
        } finally {
            setIsDeleting(false);
            setArticleToDelete(null);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <Breadcrumb items={breadcrumbs} />

            <Container>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">{t('organiser.articles.title')}</h1>
                        <Button asChild>
                            <Link to={route(RouteConfig.ORGANISER.EVENTS.ARTICLES.CREATE, { id: currentEvent?.id ?? '' })}>
                                <Plus className="size-4" />
                                {t('common.create')}
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">{t('organiser.articles.table.title')}</TableHead>
                                    <TableHead className="w-[30%]">{t('organiser.articles.table.published_at')}</TableHead>
                                    <TableHead className="w-[20%]">{t('common.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {articles.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">{article.title}</TableCell>
                                        <TableCell>{article.published_at ? formatDate(article.published_at) : t('common.not_published')}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button 
                                                    asChild 
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link to={route(RouteConfig.ORGANISER.EVENTS.ARTICLES.EDIT, { 
                                                        id: currentEvent?.id ?? '',
                                                        articleId: article.id ?? ''
                                                    })}>
                                                        <PencilLine className="size-4" />
                                                        {t('common.edit')}
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <DotsThree className="size-4" weight="bold" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={route(RouteConfig.ATTENDEE.EVENTS.ARTICLES.DETAIL, { 
                                                                id: currentEvent?.id ?? '',
                                                                articleId: article.id ?? ''
                                                            })}>
                                                                <Eye className="size-4 mr-1" />
                                                                {t('common.view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive"
                                                            onClick={() => setArticleToDelete(article)}
                                                        >
                                                            <Trash className="size-4 mr-1" />
                                                            {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Container>

            <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('organiser.articles.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('organiser.articles.delete.description')}
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
                            {isDeleting ? t('common.deleting') : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
