import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authApi } from '../../lib/api/auth';
import { route, RouteConfig } from '@/routes/route-config';

export function Signup() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authApi.signup(email);

            if (response) {
                navigate(route(RouteConfig.SIGNUP_VERIFY), { state: { email } });
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <AuthCardLayout>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{t('register.title')}</CardTitle>
                    <CardDescription>{t('register.subtitle')}</CardDescription>
                </CardHeader>
                <div className="space-y-4 p-6 pt-0">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('global.form.email.label')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('global.form.email.placeholder')}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full">
                        {t('register.submit')}
                    </Button>
                    <div className="text-center text-sm">
                        {t('register.haveAccount')}{" "}
                        <Link
                            to={route(RouteConfig.LOGIN)}
                            className="text-primary underline underline-offset-4 hover:text-primary/90">
                            {t('register.signIn')}
                        </Link>
                    </div>
                </div>
            </form>
        </AuthCardLayout>
    )
}
