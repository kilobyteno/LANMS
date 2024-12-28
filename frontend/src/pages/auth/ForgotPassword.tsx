import {useState} from 'react';
import {authApi} from '@/lib/api/auth';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Spinner} from '@/components/ui/spinner';
import {useTranslation} from 'react-i18next';
import {AuthCardLayout} from "@/components/auth/auth-card-layout.tsx";

const ForgotPassword = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useTranslation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            await authApi.passwordForgot({email});
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.forgot_password.form.error.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCardLayout>
            <Card>
                <CardHeader>
                    <CardTitle>{t('auth.forgot_password.title')}</CardTitle>
                    <CardDescription>
                        {t('auth.forgot_password.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert>
                                <AlertDescription>
                                    {t('auth.forgot_password.form.success')}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.forgot_password.form.email.label')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder={t('auth.forgot_password.form.email.placeholder')}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || success}
                        >
                            {isLoading && <Spinner/>}
                            {t('auth.forgot_password.form.submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthCardLayout>
    );
};

export default ForgotPassword;
