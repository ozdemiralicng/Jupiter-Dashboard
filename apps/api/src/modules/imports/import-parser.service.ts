import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

export type ParsedInventoryRow = {
  rowNumber: number;
  productCode: string;
  latinName: string;
  quantity: number;
  unit?: string;
  price: number;
  totalPrice: number;
  store: string;
};

export type ParsedImport = { rows: ParsedInventoryRow[]; errors: Array<{ row: number; message: string }> };

type ColumnKey = 'productCode' | 'latinName' | 'quantity' | 'unit' | 'price' | 'totalPrice' | 'store';

const REQUIRED_COLUMNS: ColumnKey[] = ['productCode', 'latinName', 'quantity', 'price', 'store'];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  productCode: 'Product Code',
  latinName: 'Latin Name',
  quantity: 'Quantity',
  unit: 'Unit',
  price: 'Price',
  totalPrice: 'Total Price',
  store: 'Store',
};
const COLUMN_ALIASES: Record<ColumnKey, string[]> = {
  productCode: ['product code', 'code', 'item code', 'item no', 'item number', 'product no', 'stock code', 'barcode', 'sku', 'material code'],
  latinName: ['latin name', 'product name', 'item name', 'name', 'description', 'latin', 'item', 'product', 'english name'],
  quantity: ['quantity', 'qty', 'stock', 'balance', 'available', 'on hand', 'current qty', 'current quantity'],
  unit: ['unit', 'uom', 'measure', 'unit name'],
  price: ['price', 'cost', 'cost price', 'unit price', 'average cost', 'avg cost'],
  totalPrice: ['total price', 'total', 'inventory value', 'value', 'total value', 'amount'],
  store: ['store', 'warehouse', 'warehouse name', 'location', 'depot', 'branch', 'mağaza', 'magaza', 'depo'],
};

@Injectable()
export class ImportParserService {
  async parse(buffer: Buffer): Promise<ParsedImport> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Workbook does not contain a worksheet');

    const header = this.findHeader(sheet);
    const columns = header.columns;
    const missing = REQUIRED_COLUMNS.filter((name) => !columns.has(name));
    if (missing.length) throw new BadRequestException(`Missing required columns: ${missing.map((name) => COLUMN_LABELS[name]).join(', ')}`);

    const rows: ParsedInventoryRow[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= header.rowNumber) return;
      const read = (name: ColumnKey) => row.getCell(columns.get(name) ?? 0).value;
      const productCode = this.toText(read('productCode'));
      const latinName = this.toText(read('latinName'));
      const quantity = this.toNumber(read('quantity'));
      const price = this.toNumber(read('price'));
      const totalPrice = columns.has('totalPrice') ? this.toNumber(read('totalPrice')) : quantity * price;
      const store = this.toText(read('store'));
      const unit = columns.has('unit') ? this.toText(read('unit')) : undefined;

      if (!productCode && !latinName && !store) return;
      if (!productCode || !latinName || !store || Number.isNaN(quantity) || Number.isNaN(price) || Number.isNaN(totalPrice)) {
        errors.push({ row: rowNumber, message: 'Required text or numeric value is invalid' });
        return;
      }
      rows.push({ rowNumber, productCode, latinName, quantity, unit, price, totalPrice, store });
    });

    if (!rows.length) throw new BadRequestException('No valid inventory rows were found in the workbook');
    return { rows, errors };
  }

  private findHeader(sheet: ExcelJS.Worksheet) {
    let best: { rowNumber: number; columns: Map<ColumnKey, number>; score: number } | null = null;
    const maxHeaderRows = Math.min(sheet.rowCount, 25);
    for (let rowNumber = 1; rowNumber <= maxHeaderRows; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const columns = new Map<ColumnKey, number>();
      row.eachCell((cell, col) => {
        const key = this.matchColumn(this.toText(cell.value));
        if (key && !columns.has(key)) columns.set(key, col);
      });
      const score = REQUIRED_COLUMNS.filter((key) => columns.has(key)).length + (columns.has('totalPrice') ? 0.5 : 0);
      if (!best || score > best.score) best = { rowNumber, columns, score };
    }
    if (!best || best.score < REQUIRED_COLUMNS.length) throw new BadRequestException('Could not find the inventory header row in the first 25 rows');
    return best;
  }

  private matchColumn(value: string): ColumnKey | undefined {
    const normalized = this.normalizeHeader(value);
    if (!normalized) return undefined;
    return (Object.keys(COLUMN_ALIASES) as ColumnKey[]).find((key) => COLUMN_ALIASES[key].some((alias) => this.normalizeHeader(alias) === normalized));
  }

  private normalizeHeader(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  private toText(value: ExcelJS.CellValue | undefined): string {
    if (value == null) return '';
    if (typeof value === 'object') {
      if ('result' in value) return this.toText(value.result as ExcelJS.CellValue);
      if ('text' in value) return String(value.text ?? '').trim();
      if ('richText' in value && Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('').trim();
      if (value instanceof Date) return value.toISOString();
    }
    return String(value).trim();
  }

  private toNumber(value: ExcelJS.CellValue | undefined) {
    const text = this.toText(value).replace(/[^\d,.-]/g, '').replace(/,/g, '');
    if (!text) return Number.NaN;
    return Number(text);
  }
}
