import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { authApi } from '@/lib/api/auth';
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import { PhoneInput } from '@/components/ui/phone-input';
import { route, RouteConfig } from '@/routes/route-config';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    password: z.string().min(12, {
        message: "Password must be at least 12 characters.",
    }),
    confirmPassword: z.string(),
    phone: z
        .string()
        .refine(isValidPhoneNumber, { message: "Invalid phone number" })
        .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

function SignupDetails() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            password: "",
            confirmPassword: "",
            phone: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            const { confirmPassword, phone, ...submitData } = data;
            
            let phoneNumber = "";
            let phoneCode = "";
            
            if (phone) {
                const parsedPhone = parsePhoneNumber(phone);
                if (parsedPhone) {
                    phoneNumber = parsedPhone.nationalNumber;
                    phoneCode = parsedPhone.countryCallingCode;
                }
            }

            const response = await authApi.signupDetails({
                email,
                phone_number: phoneNumber,
                phone_code: `+${phoneCode}`,
                ...submitData,
            });

            if (response) {
                navigate(route(RouteConfig.ORGANISER.ROOT));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthCardLayout>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>{t('signup.details.title')}</CardTitle>
                        <CardDescription>{t('signup.details.description')}</CardDescription>
                    </CardHeader>

                    <div className="space-y-4 p-6 pt-0">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.details.name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.details.password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.details.confirmPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start">
                                    <FormLabel className="text-left">{t('signup.details.phone')}</FormLabel>
                                    <FormControl className="w-full">
                                        <PhoneInput placeholder={t('signup.details.phonePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <CardFooter>
                        <Button type="submit" className="w-full">
                            {t('signup.details.submit')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </AuthCardLayout>
    );
}

export default SignupDetails;