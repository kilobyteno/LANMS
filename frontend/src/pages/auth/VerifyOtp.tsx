import { useState } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { authApi } from '../../lib/api/auth';
import { route, RouteConfig } from '@/routes/route-config';

export function VerifyOtp() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isResending, setIsResending] = useState(false);

    const email = location.state?.email;

    const FormSchema = z.object({
        code: z.string().min(6, {
            message: "Your one-time password must be 6 characters.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            code: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        if (!email) return;

        try {
            const response = await authApi.verifyOtp(email, data.code);
            if (response) {
                navigate(route(RouteConfig.SIGNUP_DETAILS), { state: { email } });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleResendCode = async () => {
        if (!email || isResending) return;

        setIsResending(true);
        try {
            await authApi.resendOtp(email);
            form.reset();
        } catch (err) {
            console.error(err);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthCardLayout>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>{t("otp.title")}</CardTitle>
                        <CardDescription>{t("otp.description")}</CardDescription>
                    </CardHeader>
                    <div className="space-y-4 p-6 pt-0">
                        <div className="flex justify-center">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('otp.form.label')}</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0}/>
                                                    <InputOTPSlot index={1}/>
                                                    <InputOTPSlot index={2}/>
                                                    <InputOTPSlot index={3}/>
                                                    <InputOTPSlot index={4}/>
                                                    <InputOTPSlot index={5}/>
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">
                            {t('otp.submit')}
                        </Button>
                        <div className="text-sm text-center space-y-2">
                            <p>
                                {t('otp.noCode')}{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={handleResendCode}
                                    disabled={isResending}
                                >
                                    {t('otp.resend')}
                                </Button>
                            </p>
                            <p>
                                <Link
                                    to={route(RouteConfig.LOGIN)}
                                    className="text-primary hover:underline">
                                    {t('otp.backToLogin')}
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </AuthCardLayout>
    );
}
