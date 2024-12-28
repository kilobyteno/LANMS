import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { PhoneInput } from '@/components/ui/phone-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useOrganisation } from '@/context/OrganisationContext';
import { useEvent } from '@/context/EventContext';
import { eventsApi } from '@/lib/api/events';
import { route } from '@/routes/route-config';
import { RouteConfig } from '@/routes/route-config';
import {parsePhoneNumber} from "react-phone-number-input";

const FormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    max_participants: z.number().optional(),
    website: z.string().optional(),
    contact_email: z.string().optional(),
    contact_phone: z.string().optional(),
    maps_url: z.string().optional(),
    address_street: z.string().optional(),
    address_city: z.string().optional(),
    address_postal_code: z.string().optional(),
    address_country: z.string().optional(),
    start_at: z.string().min(1, "Start at is required"),
    end_at: z.string().min(1, "End at is required"),
});

type FormData = z.infer<typeof FormSchema>;

export function EventForm() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentOrganisation } = useOrganisation();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { refreshEvents, setCurrentEvent } = useEvent();

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: '',
            description: '',
            max_participants: undefined,
            website: '',
            contact_email: '',
            contact_phone: '',
            maps_url: '',
            address_street: '',
            address_city: '',
            address_postal_code: '',
            address_country: '',
            start_at: '',
            end_at: '',
        },
    });

    useEffect(() => {
        async function loadEvent() {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await eventsApi.get(id);
                const event = response.data.data;

                let phoneNumber = '';
                if (event.contact_phone_code && event.contact_phone_number) {
                    phoneNumber = `${event.contact_phone_code}${event.contact_phone_number}`;
                }

                form.reset({
                    ...event,
                    contact_phone: phoneNumber,
                    start_at: new Date(event.start_at).toISOString().slice(0, 16),
                    end_at: new Date(event.end_at).toISOString().slice(0, 16),
                });
            } catch (error) {
                console.error('Failed to load event:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadEvent();
    }, [id, form]);

    const handleSave = async (data: FormData) => {
        if (!currentOrganisation) return;
        setIsSaving(true);

        let phoneNumber = "";
        let phoneCode = "";

        if (data.contact_phone) {
            const parsedPhone = parsePhoneNumber(data.contact_phone);
            if (parsedPhone) {
                phoneNumber = parsedPhone.nationalNumber;
                phoneCode = parsedPhone.countryCallingCode;
            }
        }

        const eventData = {
            ...data,
            organisation_id: currentOrganisation.id,
            contact_phone_code: phoneCode ? `+${phoneCode}` : '',
            contact_phone_number: phoneNumber,
        };

        try {
            let response;
            if (id) {
                response = await eventsApi.update(id, eventData);
            } else {
                response = await eventsApi.create(eventData);
            }
            const savedEvent = response.data.data;
            setCurrentEvent(savedEvent);
            await refreshEvents();
            navigate(route(RouteConfig.ORGANISER.ROOT));
        } catch (error) {
            console.error('Failed to save event:', error);
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
                                    {t('event.form.title.label')}
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t('event.form.title.placeholder')} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('event.form.description.label')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder={t('event.form.description.placeholder')}
                                        maxLength={500}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="start_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        {t('event.form.start_at.label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="end_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        {t('event.form.end_at.label')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="max_participants"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('event.form.max_participants.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={t('event.form.max_participants.placeholder')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('event.form.website.label')}</FormLabel>
                                <FormControl>
                                    <Input type="url" {...field} placeholder={t('event.form.website.placeholder')} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contact_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('event.form.contact_email.label')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} placeholder={t('event.form.contact_email.placeholder')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('event.form.phone.label')}</FormLabel>
                                    <FormControl>
                                        <PhoneInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="maps_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('event.form.maps_url.label')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t('event.form.maps_url.placeholder')} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address_street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('event.form.address.street.label')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('event.form.address.street.placeholder')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="address_city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('event.form.address.city.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('event.form.address.city.placeholder')} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address_postal_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('event.form.address.postal_code.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('event.form.address.postal_code.placeholder')} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address_country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('event.form.address.country.label')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t('event.form.address.country.placeholder')} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
