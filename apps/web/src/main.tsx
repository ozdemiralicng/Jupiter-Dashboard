import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoute, createRootRoute, createRouter, Link, Outlet, RouterProvider } from '@tanstack/react-router';
import { Moon, Package, Upload, Users, Warehouse, Settings, BarChart3, Home, Sun, LogOut, Boxes } from 'lucide-react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/error-boundary';
import { Button, Card, PageHeader } from './components/ui';
import { getSession, setSession } from './lib/api';
import { LanguageProvider, useI18n } from './lib/i18n';
import { AnalyticsPage } from './pages/analytics';
import { CustomersPage } from './pages/customers';
import { DashboardPage } from './pages/dashboard';
import { ImportsPage } from './pages/imports';
import { InventoryPage } from './pages/inventory';
import { LoginPage } from './pages/login';
import { ProductsPage } from './pages/products';
import { SuppliersPage } from './pages/suppliers';
import { WarehousesPage } from './pages/warehouses';
import './styles.css';

const queryClient = new QueryClient();

function AppLayout() {
  const session = getSession();
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  const { language, t, toggleLanguage } = useI18n();
  const nav = [
    { to: '/', label: t('nav.dashboard'), icon: Home },
    { to: '/inventory', label: t('nav.inventory'), icon: Package },
    { to: '/products', label: t('nav.products'), icon: Package },
    { to: '/warehouses', label: t('nav.warehouses'), icon: Warehouse },
    { to: '/suppliers', label: t('nav.suppliers'), icon: Users },
    { to: '/customers', label: t('nav.customers'), icon: Users },
    { to: '/imports', label: t('nav.imports'), icon: Upload },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  if (!session) return <LoginPage />;

  const navLinkClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/75 transition hover:bg-muted hover:text-foreground [&.active]:bg-primary/10 [&.active]:font-semibold [&.active]:text-primary';

  return (
    <div className="min-h-screen bg-muted/35">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background p-4 md:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Boxes size={20} />
          </div>
          <div>
            <div className="text-lg font-semibold leading-tight">{t('app.name')}</div>
            <div className="text-xs text-foreground/60">{t('app.tagline')}</div>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <div className="text-sm font-medium">{t('app.workspace')}</div>
            <div className="text-xs text-foreground/60">{session?.user.email}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={toggleLanguage} aria-label="Toggle language">
              {language === 'tr' ? 'EN' : 'TR'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { document.documentElement.classList.toggle('dark'); setDark(!dark); }} aria-label="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setSession(null); window.location.href = '/login'; }} aria-label="Sign out">
              <LogOut size={16} />
            </Button>
          </div>
        </header>
        <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-2 md:hidden">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/75 hover:bg-muted [&.active]:bg-primary/10 [&.active]:font-semibold [&.active]:text-primary">
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto max-w-[1600px] p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: AppLayout });
const route = (path: string, component: () => React.ReactNode) => createRoute({ getParentRoute: () => rootRoute, path, component });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DashboardPage });
const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    route('/login', LoginPage),
    route('/inventory', InventoryPage),
    route('/products', ProductsPage),
    route('/warehouses', WarehousesPage),
    route('/suppliers', SuppliersPage),
    route('/customers', CustomersPage),
    route('/imports', ImportsPage),
    route('/analytics', AnalyticsPage),
    route('/settings', () => <SettingsPage />),
  ]),
});

function SettingsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Card>
        <div className="text-sm text-foreground/60">{t('settings.subtitle')}</div>
      </Card>
    </div>
  );
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
