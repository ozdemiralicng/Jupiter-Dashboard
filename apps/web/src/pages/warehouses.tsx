import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Table } from './inventory';

type Warehouse = { id: string; name: string; location?: string; createdAt: string };

export function WarehousesPage() {
  const { locale, t } = useI18n();
  const query = useQuery({ queryKey: ['warehouses'], queryFn: () => api<Warehouse[]>('/warehouses') });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('warehouses.title')}</h1>
        <p className="text-sm text-foreground/60">{t('warehouses.subtitle')}</p>
      </div>
      <Card><Table headers={[t('fields.name'), t('table.location'), t('table.created')]} rows={(query.data ?? []).map((warehouse) => [warehouse.name, warehouse.location ?? '', new Date(warehouse.createdAt).toLocaleDateString(locale)])} /></Card>
    </div>
  );
}
