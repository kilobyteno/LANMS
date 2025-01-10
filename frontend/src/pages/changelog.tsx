import {useEffect, useState} from 'react';
import {GitHubRelease, fetchGitHubReleases} from '@/lib/api/github';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Markdown} from '@/components/ui/markdown';
import {Skeleton} from '@/components/ui/skeleton';
import {useTranslation} from 'react-i18next';
import {Breadcrumb} from '@/components/breadcrumb';
import {useBreadcrumbs} from '@/hooks/use-breadcrumbs';
import {ArrowSquareOut} from '@phosphor-icons/react';
import {formatRelativeTime} from "@/lib/utils.ts";

export default function ChangelogPage() {
    const [releases, setReleases] = useState<GitHubRelease[]>([]);
    const [loading, setLoading] = useState(true);
    const {t} = useTranslation();
    const breadcrumbs = useBreadcrumbs();

    useEffect(() => {
        const loadReleases = async () => {
            try {
                const data = await fetchGitHubReleases();
                setReleases(data);
            } catch (error) {
                console.error('Failed to fetch releases:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReleases();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-8 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/3"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full"/>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <>
            <Breadcrumb items={breadcrumbs}/>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-2">{t('changelog.title')}</h1>
                <p className="text-sm text-muted-foreground mb-8">{t('changelog.description')}</p>
                <div className="space-y-6">
                    {releases.map((release) => (
                        <Card key={release.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">
                                        {release.name || release.tag_name} {release.prerelease && <Badge variant="prerelease" className="ml-1">Pre-release</Badge>}
                                    </CardTitle>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">
                                            {formatRelativeTime(release.published_at)}
                                        </Badge>
                                        <a
                                            href={release.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-muted-foreground hover:text-primary"
                                        >
                                            {t('common.view_on_github')}
                                            <ArrowSquareOut className="size-4 ml-1 inline-block"/>
                                        </a>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="max-h-[400px] overflow-y-auto">
                                    <Markdown content={release.body}/>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
