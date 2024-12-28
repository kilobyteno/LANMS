import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { route, RouteConfig } from '@/routes/route-config';
import { organisationApi } from '@/lib/api/organisation';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useOrganisation } from '@/context/OrganisationContext';
import { PhoneInput } from '@/components/ui/phone-input';

const FormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        unit: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
    }),
});

type FormData = z.infer<typeof FormSchema>;

export function OrganisationForm() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setCurrentOrganisation, refreshOrganisations } = useOrganisation();
    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            description: '',
            website: '',
            email: '',
            phone: '',
            address: {
                street: '',
                unit: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
            },
        },
    });

    useEffect(() => {
        const loadOrganisation = async () => {
            if (!id) return;

            try {
                const response = await organisationApi.get(id);
                const org = response.data.data;
                form.reset(org);
            } catch (error) {
                console.error('Failed to load organisation:', error);
                navigate(route(RouteConfig.ORGANISER.ROOT));
            } finally {
                setIsLoading(false);
            }
        };

        loadOrganisation();
    }, [id, navigate, form]);

    const handleSave = async (data: FormData) => {
        setIsSaving(true);
        try {
            const response = id
                ? await organisationApi.update(id, data)
                : await organisationApi.create(data);
            const savedOrg = response.data.data;
            await refreshOrganisations();
            setCurrentOrganisation(savedOrg);
            navigate(route(RouteConfig.ORGANISER.ROOT));
        } catch (error) {
            console.error('Failed to save organisation:', error);
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
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                    {t('organisation.form.name.label')}
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t('organisation.form.name.placeholder')}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('organisation.form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder={t('organisation.form.description.placeholder')}
                                        maxLength={500}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{t('organisation.form.website.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="url"
                                        {...field}
                                        placeholder={t('organisation.form.website.placeholder')}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('organisation.form.email.label')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            placeholder={t('organisation.form.email.placeholder')}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('organisation.form.phone.label')}</FormLabel>
                                    <FormControl>
                                        <PhoneInput {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('organisation.form.address.street.label')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('organisation.form.address.street.placeholder')}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address.unit"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('organisation.form.address.unit.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('organisation.form.address.unit.placeholder')}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address.city"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('organisation.form.address.city.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('organisation.form.address.city.placeholder')}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address.state"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('organisation.form.address.state.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('organisation.form.address.state.placeholder')}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address.postal_code"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('organisation.form.address.postal_code.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('organisation.form.address.postal_code.placeholder')}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address.country"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{t('organisation.form.address.country.label')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('organisation.form.address.country.placeholder')}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? t('common.saving') : t('common.save')}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 