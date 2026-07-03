import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, Skeleton } from '../components/ui';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';

type Dashboard = {
  totalInventoryValue: number;
  totalProducts: number;
  negativeStockCount: number;
  warehouseCount: number;
  lastImportDate: string | null;
  recentImports: Array<{ id: string; fileName: string; status: string; createdAt: string }>;
  valueByWarehouse: Array<{ warehouse: string; value: number }>;
  topProductsByValue: Array<{ code: string; name: string; value: number }>;
  lowStockProducts: Array<{ code: string; name: string; quantity: number }>;
  negativeStockProducts: Array<{ code: string; name: string; quantity: number }>;
};

export function DashboardPage() {
  const { locale, t } = useI18n();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<Dashboard>('/analytics/dashboard') });
  if (isLoading) return <Skeleton className="h-96" />;

  const cards = [
    [t('dashboard.totalInventoryValue'), formatMoney(data?.totalInventoryValue ?? 0, locale)],
    [t('dashboard.totalProducts'), data?.totalProducts ?? 0],
    [t('dashboard.negativeStockCount'), data?.negativeStockCount ?? 0],
    [t('dashboard.warehouseCount'), data?.warehouseCount ?? 0],
    [t('dashboard.lastImportDate'), data?.lastImportDate ? new Date(data.lastImportDate).toLocaleString(locale) : t('dashboard.noImports')],
  ];
  const hasWarehouseValue = Boolean(data?.valueByWarehouse.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-foreground/60">{t('dashboard.subtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-foreground/60">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">{t('dashboard.valueByWarehouse')}</h2>
          {hasWarehouseValue ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.valueByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="warehouse" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text={t('dashboard.noChartData')} />
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
          <Rows emptyText={t('dashboard.noListData')}>{data?.recentImports.map((item) => <Row key={item.id} left={item.fileName} right={item.status} />)}</Rows>
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

function EmptyState({ text }: { text: string }) {
  return <div className="mt-4 grid h-[280px] place-items-center rounded-md border border-dashed border-border px-6 text-center text-sm text-foreground/60">{text}</div>;
}

function Rows({ children, emptyText }: { children?: ReactNode; emptyText: string }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <div className="mt-4 space-y-3">{count ? children : <div className="py-8 text-sm text-foreground/60">{emptyText}</div>}</div>;
}

function Row({ left, right }: { left: string; right: string | number }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm"><span className="truncate">{left}</span><span className="font-medium">{right}</span></div>;
}

export function formatMoney(value: number, locale = 'en-AE') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'AED' }).format(value);
}
