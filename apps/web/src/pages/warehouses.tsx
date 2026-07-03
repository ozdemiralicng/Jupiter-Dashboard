import { useQuery } from '@tanstack/react-query';
import { Badge, Card, PageHeader, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Table } from './inventory';

type Warehouse = { id: string; name: string; location?: string; createdAt: string };

export function WarehousesPage() {
  const { locale, t } = useI18n();
  const query = useQuery({ queryKey: ['warehouses'], queryFn: () => api<Warehouse[]>('/warehouses') });
  return (
    <div className="space-y-4">
      <PageHeader title={t('warehouses.title')} subtitle={t('warehouses.subtitle')} actions={<Badge>{query.data?.length ?? 0}</Badge>} />
      {query.isLoading ? <Skeleton className="h-80" /> : <Card><Table headers={[t('fields.name'), t('table.location'), t('table.created')]} rows={(query.data ?? []).map((warehouse) => [warehouse.name, warehouse.location ?? '', new Date(warehouse.createdAt).toLocaleDateString(locale)])} /></Card>}
    </div>
  );
}
