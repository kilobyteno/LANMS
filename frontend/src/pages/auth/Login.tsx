import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth.ts';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { setTokens } from '@/lib/api/client.ts';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/context/AuthContext';
import { route, RouteConfig } from '@/routes/route-config';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(12, {
    message: "Password must be at least 12 characters long",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { login } = useAuth();

    const onSubmit = async (data: FormData) => {
        try {
            await login(data.email, data.password);
            navigate(route(RouteConfig.ORGANISER.ROOT));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthCardLayout>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <CardHeader>
                        <CardTitle>{t('login.title')}</CardTitle>
                        <CardDescription>{t('login.subtitle')}</CardDescription>
                    </CardHeader>

                    <div className="space-y-4 p-6 pt-0">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('global.form.email.label')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('global.form.email.placeholder')}
                                            type="email"
                                            {...field}
                                        />
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
                                    <div className="flex items-center">
                                        <FormLabel>{t('global.form.password.label')}</FormLabel>
                                        <Link
                                            to={route(RouteConfig.AUTH.PASSWORD_FORGOT)}
                                            className="ml-auto text-sm underline-offset-2 hover:underline"
                                        >
                                            {t('login.forgotPassword')}
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">
                            {t('login.submit')}
                        </Button>
                        <div className="text-center text-sm">
                            {t('login.noAccount')}{" "}
                            <Link
                                to={route(RouteConfig.SIGNUP)}
                                className="text-primary underline underline-offset-4 hover:text-primary/90">
                                {t('login.signUp')}
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </AuthCardLayout>
    );
}
