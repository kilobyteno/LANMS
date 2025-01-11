import { Breadcrumb } from '@/components/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { ArticleForm } from './article-form';

export function ArticleCreate() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <>
            <Breadcrumb items={breadcrumbs} />
            <ArticleForm />
        </>
    );
} 