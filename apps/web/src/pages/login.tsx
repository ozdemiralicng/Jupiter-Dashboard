import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, AuthSession, setSession } from '../lib/api';
import { Button, Card, Input } from '../components/ui';
import { useI18n } from '../lib/i18n';

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
    <div className="grid min-h-screen place-items-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <p className="mt-1 text-sm text-foreground/60">{t('auth.subtitle')}</p>
          </div>
          <Button className="h-9 bg-muted text-foreground" type="button" onClick={toggleLanguage}>{language === 'tr' ? 'EN' : 'TR'}</Button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Input placeholder={t('fields.email')} {...form.register('email')} />
          <Input type="password" placeholder={t('fields.password')} {...form.register('password')} />
          {mutation.error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{t('auth.loginFailed')}</div>}
          <Button className="w-full" disabled={mutation.isPending}>{mutation.isPending ? t('actions.signingIn') : t('actions.signIn')}</Button>
        </form>
      </Card>
    </div>
  );
}
