import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { CrudPage } from './suppliers';

type Customer = { id: string; name: string; email?: string; phone?: string; whatsapp?: string; country?: string; orderNotes?: string; notes?: string };

export function CustomersPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const form = useForm<Customer>();
  const query = useQuery({ queryKey: ['customers'], queryFn: () => api<Customer[]>('/customers') });
  const create = useMutation({
    mutationFn: (values: Customer) => api('/customers', { method: 'POST', body: JSON.stringify({ name: values.name, email: values.email, phone: values.phone, whatsapp: values.whatsapp, country: values.country, orderNotes: values.notes }) }),
    onSuccess: () => { form.reset(); void queryClient.invalidateQueries({ queryKey: ['customers'] }); },
  });
  return <CrudPage title={t('customers.title')} subtitle={t('customers.subtitle')} form={form} onSubmit={(values) => create.mutate(values)} rows={(query.data ?? []).map((customer) => [customer.name, customer.email ?? '', customer.phone ?? '', customer.whatsapp ?? '', customer.country ?? '', customer.orderNotes ?? ''])} />;
}
