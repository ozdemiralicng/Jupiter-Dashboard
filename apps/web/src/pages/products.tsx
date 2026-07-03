import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, Input, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { Table } from './inventory';

type Product = { id: string; code: string; originalName: string; brand?: string; model?: string; capacity?: string; color?: string; region?: string };

export function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['products', search], queryFn: () => api<{ items: Product[] }>(`/products?search=${encodeURIComponent(search)}`) });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
        <p className="text-sm text-foreground/60">{t('products.subtitle')}</p>
      </div>
      <Card><Input placeholder={t('products.search')} value={search} onChange={(event) => setSearch(event.target.value)} /></Card>
      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <Card>
          <Table
            headers={[t('table.code'), t('table.originalName'), t('table.brand'), t('table.model'), t('table.capacity'), t('table.color'), t('table.region')]}
            rows={(data?.items ?? []).map((product) => [product.code, product.originalName, product.brand ?? '', product.model ?? '', product.capacity ?? '', product.color ?? '', product.region ?? ''])}
          />
        </Card>
      )}
    </div>
  );
}
