import { useState } from 'react';
import { authApi } from '../../lib/api/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from 'react-i18next';

const ChangePassword = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const oldPassword = formData.get('oldPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            setError(t('user.change_password.form.error.new_passwords_dont_match'));
            setIsLoading(false);
            return;
        }

        try {
            await authApi.passwordChange({
                old_password: oldPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });
        } catch (err: any) {
            setError(err.response?.data?.message || t('user.change_password.form.error.failed_to_change_password'));
        } finally {
            setIsLoading(false);
            // Reset the form using the form element
            formData.set('oldPassword', '');
            formData.set('newPassword', '');
            formData.set('confirmPassword', '');
        }
    };

    return (
        <div className="container max-w-lg mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>{t('user.change_password.title')}</CardTitle>
                        <CardDescription>
                            {t('user.change_password.description')}
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
                            <Label htmlFor="oldPassword">{t('user.change_password.form.current_password.label')}</Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                required
                                placeholder={t('user.change_password.form.current_password.placeholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">{t('user.change_password.form.new_password.label')}</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                placeholder={t('user.change_password.form.new_password.placeholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('user.change_password.form.confirm_new_password.label')}</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder={t('user.change_password.form.confirm_new_password.placeholder')}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading && <Spinner/>}
                            {isLoading ? t('user.change_password.form.changing_password') : t('user.change_password.form.change_password')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePassword; 