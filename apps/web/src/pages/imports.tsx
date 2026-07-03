import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, Card, Input } from '../components/ui';
import { api, upload } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { formatMoney } from './dashboard';
import { Table } from './inventory';

type ImportLog = { id: string; fileName: string; status: string; rowCount: number; validRows: number; invalidRows: number; createdAt: string };
type Preview = { fileName: string; rows: Array<{ productCode: string; latinName: string; quantity: number; price: number; totalPrice: number; store: string }>; errors: Array<{ row: number; message: string }>; summary: { validRows: number; totalValue: number } };
type ImportResult = { validRows: number; invalidRows: number; totalValue: number };

export function ImportsPage() {
  const { locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const imports = useQuery({ queryKey: ['imports'], queryFn: () => api<ImportLog[]>('/imports') });
  const previewMutation = useMutation({
    mutationFn: (selected: File) => upload<Preview>('/imports/preview', selected),
    onMutate: () => { setSuccessMessage(null); setPreview(null); },
    onSuccess: setPreview,
  });
  const importMutation = useMutation({
    mutationFn: (selected: File) => upload<ImportResult>('/imports', selected),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['imports'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      const invalidText = result.invalidRows ? ` - ${result.invalidRows} ${t('imports.validationErrors')}` : '';
      setSuccessMessage(`${result.validRows} ${t('imports.validRows')} - ${formatMoney(result.totalValue, locale)}${invalidText}`);
      setPreview(null);
      setFile(null);
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('imports.title')}</h1>
        <p className="text-sm text-foreground/60">{t('imports.subtitle')}</p>
      </div>
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Button disabled={!file || previewMutation.isPending} onClick={() => file && previewMutation.mutate(file)}>{t('actions.preview')}</Button>
          <Button disabled={!file || !preview || importMutation.isPending} onClick={() => file && importMutation.mutate(file)}>{t('actions.importSnapshot')}</Button>
        </div>
        {previewMutation.error && <Alert tone="error" text={previewMutation.error.message} />}
        {importMutation.error && <Alert tone="error" text={importMutation.error.message} />}
        {successMessage && <Alert tone="success" text={successMessage} />}
        {preview && <div className="rounded-md bg-muted p-3 text-sm">{preview.summary.validRows} {t('imports.validRows')} - {formatMoney(preview.summary.totalValue, locale)} - {preview.errors.length} {t('imports.validationErrors')}</div>}
        {!!preview?.errors.length && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <div className="font-medium">{preview.errors.length} {t('imports.validationErrors')}</div>
            <ul className="mt-2 space-y-1">
              {preview.errors.slice(0, 10).map((error) => <li key={`${error.row}-${error.message}`}>{t('table.rows')} {error.row}: {error.message}</li>)}
            </ul>
            {preview.errors.length > 10 && <div className="mt-2">+{preview.errors.length - 10}</div>}
          </div>
        )}
      </Card>
      {preview && (
        <Card>
          <h2 className="mb-3 font-semibold">{t('imports.preview')}</h2>
          <Table
            headers={[t('table.code'), t('fields.name'), t('table.qty'), t('table.price'), t('table.value'), t('table.store')]}
            rows={preview.rows.slice(0, 25).map((row) => [row.productCode, row.latinName, row.quantity, formatMoney(row.price, locale), formatMoney(row.totalPrice, locale), row.store])}
          />
        </Card>
      )}
      <Card>
        <h2 className="mb-3 font-semibold">{t('imports.history')}</h2>
        <Table
          headers={[t('table.file'), t('table.status'), t('table.rows'), t('table.valid'), t('table.invalid'), t('table.importedAt')]}
          rows={(imports.data ?? []).map((item) => [item.fileName, item.status, item.rowCount, item.validRows, item.invalidRows, new Date(item.createdAt).toLocaleString(locale)])}
        />
      </Card>
    </div>
  );
}

function Alert({ tone, text }: { tone: 'error' | 'success'; text: string }) {
  const classes = tone === 'error' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100';
  return <div className={`rounded-md border px-3 py-2 text-sm ${classes}`}>{text}</div>;
}
