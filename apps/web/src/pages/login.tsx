import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, AuthSession, setSession } from '../lib/api';
import { Alert, Button, Card, Input } from '../components/ui';
import { useI18n } from '../lib/i18n';
import { Boxes } from 'lucide-react';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const { language, t, toggleLanguage } = useI18n();
  const form = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { email: 'admin@tradingcopilot.local', password: 'Admin@123456' } });
  const mutation = useMutation({
    mutationFn: (values: LoginValues) => api<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: (session) => { setSession(session); window.location.href = '/'; },
  });

  return (
    <div className="grid min-h-screen place-items-center bg-muted/60 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Boxes size={22} />
            </div>
            <div>
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <p className="mt-1 text-sm text-foreground/60">{t('auth.subtitle')}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" type="button" onClick={toggleLanguage}>{language === 'tr' ? 'EN' : 'TR'}</Button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Input placeholder={t('fields.email')} {...form.register('email')} />
          <Input type="password" placeholder={t('fields.password')} {...form.register('password')} />
          {mutation.error && <Alert tone="error">{mutation.error.message || t('auth.loginFailed')}</Alert>}
          <Button className="w-full" disabled={mutation.isPending}>{mutation.isPending ? t('actions.signingIn') : t('actions.signIn')}</Button>
        </form>
      </Card>
    </div>
  );
}
