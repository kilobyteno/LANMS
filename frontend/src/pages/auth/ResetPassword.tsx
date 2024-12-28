import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { RouteConfig } from '@/routes/route-config';
import { ArrowLeft } from '@phosphor-icons/react';
import {AuthCardLayout} from "@/components/auth/auth-card-layout.tsx";

const ResetPassword = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reset_token = searchParams.get('reset_token');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const passwordConfirmation = formData.get('password_confirmation') as string;

        if (!reset_token) {
            setError(t('auth.reset_password.form.error.invalid_reset_token'));
            return;
        }

        if (password !== passwordConfirmation) {
            setError(t('auth.reset_password.form.error.passwords_dont_match'));
            return;
        }

        try {
            await authApi.passwordReset({
                reset_token,
                password,
                password_confirmation: passwordConfirmation
            });
            navigate(RouteConfig.LOGIN);
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.reset_password.form.error.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCardLayout>
            <Card>
                <CardHeader>
                    <div className="mb-4">
                        <Link
                            to={RouteConfig.AUTH.PASSWORD_FORGOT}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.back')}
                        </Link>
                    </div>
                    <CardTitle>{t('auth.reset_password.title')}</CardTitle>
                    <CardDescription>
                        {t('auth.reset_password.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.reset_password.form.password.label')}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder={t('auth.reset_password.form.password.placeholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                {t('auth.reset_password.form.password_confirmation.label')}
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                placeholder={t('auth.reset_password.form.password_confirmation.placeholder')}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading && <Spinner />}
                            {t('auth.reset_password.form.submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthCardLayout>
    );
};

export default ResetPassword;
