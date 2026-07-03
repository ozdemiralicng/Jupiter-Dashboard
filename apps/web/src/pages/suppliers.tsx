import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button, Card, Input } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Table } from './inventory';

type Supplier = { id: string; name: string; email?: string; phone?: string; whatsapp?: string; country?: string; notes?: string };

export function SuppliersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const form = useForm<Supplier>();
  const query = useQuery({ queryKey: ['suppliers'], queryFn: () => api<Supplier[]>('/suppliers') });
  const create = useMutation({ mutationFn: (values: Supplier) => api('/suppliers', { method: 'POST', body: JSON.stringify(values) }), onSuccess: () => { form.reset(); void queryClient.invalidateQueries({ queryKey: ['suppliers'] }); } });
  return <CrudPage title={t('suppliers.title')} subtitle={t('suppliers.subtitle')} form={form} onSubmit={(values) => create.mutate(values)} rows={(query.data ?? []).map((supplier) => [supplier.name, supplier.email ?? '', supplier.phone ?? '', supplier.whatsapp ?? '', supplier.country ?? '', supplier.notes ?? ''])} />;
}

export function CrudPage({ title, subtitle, form, onSubmit, rows }: { title: string; subtitle: string; form: ReturnType<typeof useForm<any>>; onSubmit: (values: any) => void; rows: Array<Array<string>> }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-foreground/60">{subtitle}</p>
      </div>
      <Card>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input placeholder={t('fields.name')} {...form.register('name', { required: true })} />
          <Input placeholder={t('fields.email')} {...form.register('email')} />
          <Input placeholder={t('fields.phone')} {...form.register('phone')} />
          <Input placeholder={t('fields.whatsapp')} {...form.register('whatsapp')} />
          <Input placeholder={t('fields.country')} {...form.register('country')} />
          <Input placeholder={t('fields.notes')} {...form.register('notes')} />
          <Button className="md:col-span-3">{t('actions.save')}</Button>
        </form>
      </Card>
      <Card><Table headers={[t('fields.name'), t('fields.email'), t('fields.phone'), t('fields.whatsapp'), t('fields.country'), t('fields.notes')]} rows={rows} /></Card>
    </div>
  );
}
