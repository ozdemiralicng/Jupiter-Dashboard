import { DashboardPage } from './dashboard';
import { useI18n } from '../lib/i18n';

export function AnalyticsPage() {
  const { t } = useI18n();
  return <DashboardPage title={t('analytics.title')} subtitle={t('analytics.subtitle')} />;
}
