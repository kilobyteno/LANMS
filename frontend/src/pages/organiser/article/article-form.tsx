import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { route, RouteConfig } from '@/routes/route-config';
import { articlesApi } from '@/lib/api/event-articles';
import { useEvent } from '@/context/EventContext';
import { slugify } from '@/lib/utils';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import '@/styles/simplemde-custom.css';
import { FloppyDisk } from '@phosphor-icons/react';

const FormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof FormSchema>;

export function ArticleForm() {
    const { articleId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(!!articleId);
    const [isSaving, setIsSaving] = useState(false);
    const {currentEvent} = useEvent();
    const [content, setContent] = useState('');

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    useEffect(() => {
        const loadArticle = async () => {
            if (!articleId || !currentEvent?.id) return;

            try {
                const response = await articlesApi.get(currentEvent.id, articleId);
                const article = response.data.data;
                form.reset(article);
                setContent(article.content);
            } catch (error) {
                console.error('Failed to load article:', error);
                navigate(route(RouteConfig.ORGANISER.EVENTS.ARTICLES.LIST, { id: currentEvent.id }));
            } finally {
                setIsLoading(false);
            }
        };

        loadArticle();
    }, [articleId, currentEvent?.id, navigate, form]);

    const handleSave = async (data: FormData) => {
        if (!currentEvent?.id) return;
        const articleData = {
            ...data,
            content: content,
            published_at: new Date().toISOString(),
            slug: slugify(data.title),
        };

        setIsSaving(true);
        try {
            if (articleId) {
                await articlesApi.update(currentEvent.id, articleId, articleData);
            } else {
                await articlesApi.create(currentEvent.id, articleData);
            }
            navigate(route(RouteConfig.ORGANISER.EVENTS.ARTICLES.LIST, { id: currentEvent.id }));
        } catch (error) {
            console.error('Failed to save article:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div>{t('common.loading')}</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                    {t('article.form.title.label')}
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t('article.form.title.placeholder')} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => {

                            return (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        {t('article.form.content.label')}
                                    </FormLabel>
                                    <FormControl>
                                        <SimpleMDE
                                            value={field.value}
                                            options={{
                                                spellChecker: false,
                                                placeholder: t('article.form.content.placeholder'),
                                            }}
                                            onChange={(value) => {
                                                setContent(value);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isSaving}>
                        <FloppyDisk className="size-4" weight="bold" />
                        {isSaving ? t('common.saving') : t('common.save')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
