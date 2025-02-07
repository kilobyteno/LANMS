import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/breadcrumb';
import { Container } from '@/components/container';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { articlesApi } from '@/lib/api/event-articles';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { formatDate } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

export default function ArticleDetailPage() {
    const { t } = useTranslation();
    const { id, articleId } = useParams();
    const breadcrumbs = useBreadcrumbs();
    const [article, setArticle] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id || !articleId) return;

            try {
                const response = await articlesApi.get(id, articleId);
                setArticle(response.data.data);
            } catch (error) {
                console.error('Failed to fetch article:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [id, articleId]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!article) {
        return (
            <Container>
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold">{t('attendee.articles.not_found')}</h1>
                </div>
            </Container>
        );
    }

    return (
        <>
            <Breadcrumb items={breadcrumbs} />
            
            <Container>
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>{article.title}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            {formatDate(article.published_at)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                            <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
} 