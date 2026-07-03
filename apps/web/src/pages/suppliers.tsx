import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { Alert, Badge, Button, Card, Input, PageHeader, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Table } from './inventory';

type Supplier = { id: string; name: string; email?: string; phone?: string; whatsapp?: string; country?: string; notes?: string };
export type ContactFormValues = { name: string; email?: string; phone?: string; whatsapp?: string; country?: string; notes?: string };

export function SuppliersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<ContactFormValues>();
  const query = useQuery({ queryKey: ['suppliers'], queryFn: () => api<Supplier[]>('/suppliers') });
  const create = useMutation({
    mutationFn: (values: ContactFormValues) => api('/suppliers', { method: 'POST', body: JSON.stringify(values) }),
    onMutate: () => setSuccessMessage(null),
    onSuccess: () => {
      form.reset();
      setSuccessMessage(t('messages.saved'));
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
  return (
    <CrudPage
      title={t('suppliers.title')}
      subtitle={t('suppliers.subtitle')}
      form={form}
      onSubmit={(values) => create.mutate(values)}
      rows={(query.data ?? []).map((supplier) => [supplier.name, supplier.email ?? '', supplier.phone ?? '', supplier.whatsapp ?? '', supplier.country ?? '', supplier.notes ?? ''])}
      count={query.data?.length ?? 0}
      isLoading={query.isLoading}
      isSaving={create.isPending}
      error={create.error}
      successMessage={successMessage}
    />
  );
}

export function CrudPage({
  title,
  subtitle,
  form,
  onSubmit,
  rows,
  count,
  isLoading,
  isSaving,
  error,
  successMessage,
}: {
  title: string;
  subtitle: string;
  form: UseFormReturn<ContactFormValues>;
  onSubmit: SubmitHandler<ContactFormValues>;
  rows: Array<Array<string>>;
  count: number;
  isLoading: boolean;
  isSaving: boolean;
  error?: Error | null;
  successMessage?: string | null;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} actions={<Badge>{count}</Badge>} />
      <Card>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input placeholder={t('fields.name')} {...form.register('name', { required: true })} />
          <Input placeholder={t('fields.email')} {...form.register('email')} />
          <Input placeholder={t('fields.phone')} {...form.register('phone')} />
          <Input placeholder={t('fields.whatsapp')} {...form.register('whatsapp')} />
          <Input placeholder={t('fields.country')} {...form.register('country')} />
          <Input placeholder={t('fields.notes')} {...form.register('notes')} />
          <Button className="md:col-span-3" disabled={isSaving}>{isSaving ? t('actions.saving') : t('actions.save')}</Button>
        </form>
        {error && <div className="mt-3"><Alert tone="error">{error.message}</Alert></div>}
        {successMessage && <div className="mt-3"><Alert tone="success">{successMessage}</Alert></div>}
      </Card>
      {isLoading ? <Skeleton className="h-80" /> : <Card><Table headers={[t('fields.name'), t('fields.email'), t('fields.phone'), t('fields.whatsapp'), t('fields.country'), t('fields.notes')]} rows={rows} /></Card>}
    </div>
  );
}
