import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'tr';

const dictionaries = {
  en: {
    'app.name': 'Jupiter GSM Dashboard',
    'app.tagline': 'Dubai mobile wholesale dashboard',
    'app.workspace': 'Decision support workspace',
    'nav.dashboard': 'Dashboard',
    'nav.inventory': 'Inventory',
    'nav.products': 'Products',
    'nav.warehouses': 'Warehouses',
    'nav.suppliers': 'Suppliers',
    'nav.customers': 'Customers',
    'nav.imports': 'Imports',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'actions.save': 'Save',
    'actions.saving': 'Saving...',
    'actions.preview': 'Preview',
    'actions.importSnapshot': 'Import Snapshot',
    'actions.signIn': 'Sign in',
    'actions.signingIn': 'Signing in...',
    'auth.subtitle': 'Sign in to the decision dashboard.',
    'auth.loginFailed': 'Login failed. Check API availability and credentials.',
    'messages.saved': 'Saved successfully.',
    'fields.email': 'Email',
    'fields.password': 'Password',
    'fields.name': 'Name',
    'fields.phone': 'Phone',
    'fields.whatsapp': 'WhatsApp',
    'fields.country': 'Country',
    'fields.notes': 'Notes',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Latest immutable Al Ameen inventory snapshot.',
    'dashboard.totalInventoryValue': 'Total Inventory Value',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.negativeStockCount': 'Negative Stock Count',
    'dashboard.warehouseCount': 'Warehouse Count',
    'dashboard.lastImportDate': 'Last Import Date',
    'dashboard.noImports': 'No imports',
    'dashboard.valueByWarehouse': 'Inventory Value by Warehouse',
    'dashboard.topProductsByValue': 'Top Products by Value',
    'dashboard.recentImports': 'Recent Imports',
    'dashboard.lowStockProducts': 'Low Stock Products',
    'dashboard.negativeStockProducts': 'Negative Stock Products',
    'dashboard.noChartData': 'No inventory data yet. Import an Excel file to populate this chart.',
    'dashboard.noListData': 'No records yet.',
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Operational trends and exception lists from the latest inventory snapshot.',
    'inventory.title': 'Inventory',
    'inventory.subtitle': 'Search and filter the latest imported snapshot.',
    'inventory.search': 'Search product code or name',
    'inventory.allStock': 'All stock',
    'inventory.positive': 'Positive',
    'inventory.low': 'Low stock',
    'inventory.negative': 'Negative',
    'products.title': 'Products',
    'products.subtitle': 'Original Al Ameen names with normalized trading attributes.',
    'products.search': 'Search products',
    'imports.title': 'Imports',
    'imports.subtitle': 'Upload Al Ameen inventory checklists. Imports append snapshots and rollback is disabled.',
    'imports.validRows': 'valid rows',
    'imports.validationErrors': 'validation errors',
    'imports.preview': 'Preview',
    'imports.history': 'Import History',
    'suppliers.title': 'Suppliers',
    'suppliers.subtitle': 'Supplier contact, country, WhatsApp, and notes.',
    'customers.title': 'Customers',
    'customers.subtitle': 'Customer contact details and order notes.',
    'warehouses.title': 'Warehouses',
    'warehouses.subtitle': 'Stores discovered from immutable Al Ameen imports.',
    'settings.title': 'Settings',
    'settings.subtitle': 'Authentication, roles, import policies, and integration settings are managed here.',
    'table.noRecords': 'No records found.',
    'table.code': 'Code',
    'table.product': 'Product',
    'table.warehouse': 'Warehouse',
    'table.qty': 'Qty',
    'table.avgCost': 'Avg Cost',
    'table.value': 'Value',
    'table.originalName': 'Original Name',
    'table.brand': 'Brand',
    'table.model': 'Model',
    'table.capacity': 'Capacity',
    'table.color': 'Color',
    'table.region': 'Region',
    'table.location': 'Location',
    'table.created': 'Created',
    'table.file': 'File',
    'table.status': 'Status',
    'table.rows': 'Rows',
    'table.valid': 'Valid',
    'table.invalid': 'Invalid',
    'table.importedAt': 'Imported At',
    'table.price': 'Price',
    'table.store': 'Store',
  },
  tr: {
    'app.name': 'Jupiter GSM Dashboard',
    'app.tagline': 'Dubai telefon toptan satış paneli',
    'app.workspace': 'Karar destek çalışma alanı',
    'nav.dashboard': 'Panel',
    'nav.inventory': 'Stok',
    'nav.products': 'Ürünler',
    'nav.warehouses': 'Depolar',
    'nav.suppliers': 'Tedarikçiler',
    'nav.customers': 'Müşteriler',
    'nav.imports': 'İçe Aktarımlar',
    'nav.analytics': 'Analitik',
    'nav.settings': 'Ayarlar',
    'actions.save': 'Kaydet',
    'actions.saving': 'Kaydediliyor...',
    'actions.preview': 'Önizle',
    'actions.importSnapshot': 'Stok Görüntüsü Aktar',
    'actions.signIn': 'Giriş yap',
    'actions.signingIn': 'Giriş yapılıyor...',
    'auth.subtitle': 'Karar destek paneline giriş yapın.',
    'auth.loginFailed': 'Giriş başarısız. API erişimini ve bilgileri kontrol edin.',
    'messages.saved': 'Başarıyla kaydedildi.',
    'fields.email': 'E-posta',
    'fields.password': 'Şifre',
    'fields.name': 'Ad',
    'fields.phone': 'Telefon',
    'fields.whatsapp': 'WhatsApp',
    'fields.country': 'Ülke',
    'fields.notes': 'Notlar',
    'dashboard.title': 'Panel',
    'dashboard.subtitle': 'Son değiştirilemez Al Ameen stok görüntüsü.',
    'dashboard.totalInventoryValue': 'Toplam Stok Değeri',
    'dashboard.totalProducts': 'Toplam Ürün',
    'dashboard.negativeStockCount': 'Negatif Stok Sayısı',
    'dashboard.warehouseCount': 'Depo Sayısı',
    'dashboard.lastImportDate': 'Son İçe Aktarım',
    'dashboard.noImports': 'Henüz import yok',
    'dashboard.valueByWarehouse': 'Depoya Göre Stok Değeri',
    'dashboard.topProductsByValue': 'Değere Göre En Yüksek Ürünler',
    'dashboard.recentImports': 'Son İçe Aktarımlar',
    'dashboard.lowStockProducts': 'Düşük Stoklu Ürünler',
    'dashboard.negativeStockProducts': 'Negatif Stoklu Ürünler',
    'dashboard.noChartData': 'Henüz stok verisi yok. Bu grafiği doldurmak için Excel dosyası import edin.',
    'dashboard.noListData': 'Henüz kayıt yok.',
    'analytics.title': 'Analitik',
    'analytics.subtitle': 'Son stok görüntüsünden operasyon trendleri ve istisna listeleri.',
    'inventory.title': 'Stok',
    'inventory.subtitle': 'Son import edilen stok görüntüsünde arama ve filtreleme yapın.',
    'inventory.search': 'Ürün kodu veya adı ara',
    'inventory.allStock': 'Tüm stok',
    'inventory.positive': 'Pozitif',
    'inventory.low': 'Düşük stok',
    'inventory.negative': 'Negatif',
    'products.title': 'Ürünler',
    'products.subtitle': 'Al Ameen ürün adları ve ayrıştırılmış ticari özellikler.',
    'products.search': 'Ürün ara',
    'imports.title': 'İçe Aktarımlar',
    'imports.subtitle': 'Al Ameen stok Excel dosyalarını yükleyin. Her import yeni bir stok görüntüsü ekler, geri alma kapalıdır.',
    'imports.validRows': 'geçerli satır',
    'imports.validationErrors': 'doğrulama hatası',
    'imports.preview': 'Önizleme',
    'imports.history': 'İçe Aktarım Geçmişi',
    'suppliers.title': 'Tedarikçiler',
    'suppliers.subtitle': 'Tedarikçi iletişim, ülke, WhatsApp ve not bilgileri.',
    'customers.title': 'Müşteriler',
    'customers.subtitle': 'Müşteri iletişim bilgileri ve sipariş notları.',
    'warehouses.title': 'Depolar',
    'warehouses.subtitle': 'Al Ameen importlarından tespit edilen depolar.',
    'settings.title': 'Ayarlar',
    'settings.subtitle': 'Kimlik doğrulama, roller, import politikaları ve entegrasyon ayarları burada yönetilir.',
    'table.noRecords': 'Kayıt bulunamadı.',
    'table.code': 'Kod',
    'table.product': 'Ürün',
    'table.warehouse': 'Depo',
    'table.qty': 'Miktar',
    'table.avgCost': 'Ortalama Maliyet',
    'table.value': 'Değer',
    'table.originalName': 'Orijinal Ad',
    'table.brand': 'Marka',
    'table.model': 'Model',
    'table.capacity': 'Kapasite',
    'table.color': 'Renk',
    'table.region': 'Bölge',
    'table.location': 'Lokasyon',
    'table.created': 'Oluşturma',
    'table.file': 'Dosya',
    'table.status': 'Durum',
    'table.rows': 'Satır',
    'table.valid': 'Geçerli',
    'table.invalid': 'Hatalı',
    'table.importedAt': 'İçe Aktarım Tarihi',
    'table.price': 'Fiyat',
    'table.store': 'Mağaza',
  },
} as const;

type TranslationKey = keyof typeof dictionaries.en;

type I18nContextValue = {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('jupiter-gsm-language');
    return stored === 'tr' || stored === 'en' ? stored : 'tr';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = dictionaries[language]['app.name'];
    localStorage.setItem('jupiter-gsm-language', language);
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const setLanguage = (next: Language) => setLanguageState(next);
    return {
      language,
      locale: language === 'tr' ? 'tr-TR' : 'en-AE',
      setLanguage,
      toggleLanguage: () => setLanguageState((current) => (current === 'tr' ? 'en' : 'tr')),
      t: (key) => dictionaries[language][key] ?? dictionaries.en[key],
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside LanguageProvider');
  return context;
}
