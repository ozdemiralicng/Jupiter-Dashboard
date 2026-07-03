import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useState } from 'react';
import { Badge, Card, Input, PageHeader, Select, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { formatMoney } from './dashboard';

type InventoryItem = { id: string; quantity: string; price: string; totalPrice: string; product: { code: string; originalName: string; brand?: string; model?: string }; warehouse: { name: string } };
type InventoryResponse = { items: InventoryItem[]; total: number; page: number; pageSize: number };

export function InventoryPage() {
  const { locale, t } = useI18n();
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState('all');
  const { data, isLoading } = useQuery({ queryKey: ['inventory', search, stock], queryFn: () => api<InventoryResponse>(`/inventory?search=${encodeURIComponent(search)}&stock=${stock}`) });

  return (
    <div className="space-y-4">
      <PageHeader title={t('inventory.title')} subtitle={t('inventory.subtitle')} actions={<Badge>{data?.total ?? 0}</Badge>} />
      <Card className="flex flex-col gap-3 md:flex-row">
        <Input placeholder={t('inventory.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={stock} onChange={(event) => setStock(event.target.value)}>
          <option value="all">{t('inventory.allStock')}</option>
          <option value="positive">{t('inventory.positive')}</option>
          <option value="low">{t('inventory.low')}</option>
          <option value="negative">{t('inventory.negative')}</option>
        </Select>
      </Card>
      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <Table
            headers={[t('table.code'), t('table.product'), t('table.warehouse'), t('table.qty'), t('table.avgCost'), t('table.value')]}
            rows={(data?.items ?? []).map((item) => [
              item.product.code,
              item.product.originalName,
              item.warehouse.name,
              <Quantity key={`${item.id}-qty`} value={Number(item.quantity)} locale={locale} />,
              formatMoney(Number(item.price), locale),
              formatMoney(Number(item.totalPrice), locale),
            ])}
          />
        </Card>
      )}
    </div>
  );
}

export function Table({ headers, rows, emptyText }: { headers: string[]; rows: Array<Array<ReactNode>>; emptyText?: string }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60">{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-medium text-foreground/70">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/70 transition hover:bg-muted/40">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-sm truncate px-4 py-3" title={typeof cell === 'string' || typeof cell === 'number' ? String(cell) : undefined}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="py-8 text-center text-sm text-foreground/60">{emptyText ?? t('table.noRecords')}</div>}
    </div>
  );
}

function Quantity({ value, locale }: { value: number; locale: string }) {
  const tone = value < 0 ? 'text-red-600 dark:text-red-300' : value > 0 && value <= 5 ? 'text-amber-700 dark:text-amber-300' : 'text-foreground';
  return <span className={tone}>{new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(value)}</span>;
}
