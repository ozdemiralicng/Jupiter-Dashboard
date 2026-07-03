import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, Input, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { formatMoney } from './dashboard';

type InventoryItem = { id: string; quantity: string; price: string; totalPrice: string; product: { code: string; originalName: string; brand?: string; model?: string }; warehouse: { name: string } };

export function InventoryPage() {
  const { locale, t } = useI18n();
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState('all');
  const { data, isLoading } = useQuery({ queryKey: ['inventory', search, stock], queryFn: () => api<{ items: InventoryItem[] }>(`/inventory?search=${encodeURIComponent(search)}&stock=${stock}`) });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('inventory.title')}</h1>
        <p className="text-sm text-foreground/60">{t('inventory.subtitle')}</p>
      </div>
      <Card className="flex flex-col gap-3 md:flex-row">
        <Input placeholder={t('inventory.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={stock} onChange={(event) => setStock(event.target.value)}>
          <option value="all">{t('inventory.allStock')}</option>
          <option value="positive">{t('inventory.positive')}</option>
          <option value="low">{t('inventory.low')}</option>
          <option value="negative">{t('inventory.negative')}</option>
        </select>
      </Card>
      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <Table
            headers={[t('table.code'), t('table.product'), t('table.warehouse'), t('table.qty'), t('table.avgCost'), t('table.value')]}
            rows={(data?.items ?? []).map((item) => [item.product.code, item.product.originalName, item.warehouse.name, item.quantity, formatMoney(Number(item.price), locale), formatMoney(Number(item.totalPrice), locale)])}
          />
        </Card>
      )}
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">{headers.map((header) => <th key={header} className="py-3 pr-4 font-medium">{header}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <tr key={index} className="border-b border-border/70">{row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-sm truncate py-3 pr-4">{cell}</td>)}</tr>)}</tbody>
      </table>
      {!rows.length && <div className="py-8 text-center text-sm text-foreground/60">{t('table.noRecords')}</div>}
    </div>
  );
}
