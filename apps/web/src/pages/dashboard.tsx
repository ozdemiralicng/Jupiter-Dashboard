import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, Card, EmptyState, PageHeader, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Dashboard = {
  totalInventoryValue: number;
  totalProducts: number;
  negativeStockCount: number;
  warehouseCount: number;
  lastImportDate: string | null;
  recentImports: Array<{ id: string; fileName: string; status: string; invalidRows: number; createdAt: string }>;
  valueByWarehouse: Array<{ warehouse: string; value: number }>;
  topProductsByValue: Array<{ code: string; name: string; value: number }>;
  lowStockProducts: Array<{ code: string; name: string; quantity: number }>;
  negativeStockProducts: Array<{ code: string; name: string; quantity: number }>;
};

export function DashboardPage({ title, subtitle }: { title?: string; subtitle?: string } = {}) {
  const { locale, t } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<Dashboard>('/analytics/dashboard') });
  if (isLoading) return <Skeleton className="h-96" />;

  const cards = [
    { label: t('dashboard.totalInventoryValue'), value: formatMoney(data?.totalInventoryValue ?? 0, locale) },
    { label: t('dashboard.totalProducts'), value: data?.totalProducts ?? 0 },
    { label: t('dashboard.negativeStockCount'), value: data?.negativeStockCount ?? 0, tone: 'text-red-600 dark:text-red-300' },
    { label: t('dashboard.warehouseCount'), value: data?.warehouseCount ?? 0 },
    { label: t('dashboard.lastImportDate'), value: data?.lastImportDate ? new Date(data.lastImportDate).toLocaleString(locale) : t('dashboard.noImports') },
  ];
  const hasWarehouseValue = Boolean(data?.valueByWarehouse.length);

  return (
    <div className="space-y-6">
      <PageHeader title={title ?? t('dashboard.title')} subtitle={subtitle ?? t('dashboard.subtitle')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="min-h-28">
            <div className="text-sm text-foreground/60">{card.label}</div>
            <div className={`mt-3 break-words text-2xl font-semibold ${card.tone ?? ''}`}>{card.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">{t('dashboard.valueByWarehouse')}</h2>
          {hasWarehouseValue ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.valueByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="warehouse" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(Number(value), locale)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text={t('dashboard.noChartData')} className="mt-4 h-[280px]" />
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">{t('dashboard.topProductsByValue')}</h2>
          <Rows emptyText={t('dashboard.noListData')}>
            {data?.topProductsByValue.map((product) => <Row key={product.code} left={`${product.code} - ${product.name}`} right={formatMoney(product.value, locale)} />)}
          </Rows>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">{t('dashboard.recentImports')}</h2>
          <Rows emptyText={t('dashboard.noListData')}>{data?.recentImports.map((item) => <Row key={item.id} left={item.fileName} right={<ImportStatus status={item.status} invalidRows={item.invalidRows} />} />)}</Rows>
        </Card>
        <Card>
          <h2 className="font-semibold">{t('dashboard.lowStockProducts')}</h2>
          <Rows emptyText={t('dashboard.noListData')}>{data?.lowStockProducts.map((product) => <Row key={product.code} left={product.name} right={product.quantity} />)}</Rows>
        </Card>
        <Card>
          <h2 className="font-semibold">{t('dashboard.negativeStockProducts')}</h2>
          <Rows emptyText={t('dashboard.noListData')}>{data?.negativeStockProducts.map((product) => <Row key={product.code} left={product.name} right={product.quantity} />)}</Rows>
        </Card>
      </div>
    </div>
  );
}

function Rows({ children, emptyText }: { children?: ReactNode; emptyText: string }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <div className="mt-4 space-y-3">{count ? children : <div className="py-8 text-sm text-foreground/60">{emptyText}</div>}</div>;
}

function Row({ left, right }: { left: string; right: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm"><span className="truncate">{left}</span><span className="font-medium">{right}</span></div>;
}

function ImportStatus({ status, invalidRows }: { status: string; invalidRows: number }) {
  const className = status === 'COMPLETED'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
    : status === 'FAILED'
      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200';
  return <Badge className={className}>{status}{invalidRows ? ` · ${invalidRows}` : ''}</Badge>;
}

export function formatMoney(value: number, locale = 'en-AE') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'AED' }).format(value);
}
