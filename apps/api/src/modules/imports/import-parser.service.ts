import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

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
  store: ['store', 'warehouse', 'warehouse name', 'location', 'depot', 'branch', 'magaza', 'mağaza', 'depo'],
};

@Injectable()
export class ImportParserService {
  async parse(buffer: Buffer, fileName = ''): Promise<ParsedImport> {
    const matrix = await this.readWorkbook(buffer, fileName);
    const header = this.findHeader(matrix);
    const missing = REQUIRED_COLUMNS.filter((name) => !header.columns.has(name));
    if (missing.length) throw new BadRequestException(`Missing required columns: ${missing.map((name) => COLUMN_LABELS[name]).join(', ')}`);

    const rows: ParsedInventoryRow[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    matrix.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      if (rowNumber <= header.rowNumber) return;

      const read = (name: ColumnKey) => row[header.columns.get(name) ?? -1];
      const productCode = this.toText(read('productCode'));
      const latinName = this.toText(read('latinName'));
      const quantity = this.toNumber(read('quantity'));
      const price = this.toNumber(read('price'));
      const parsedTotalPrice = header.columns.has('totalPrice') ? this.toNumber(read('totalPrice')) : Number.NaN;
      const totalPrice = Number.isNaN(parsedTotalPrice) ? quantity * price : parsedTotalPrice;
      const store = this.toText(read('store'));
      const unit = header.columns.has('unit') ? this.toText(read('unit')) : undefined;

      if (!productCode && !latinName && !store) return;
      const invalidFields = [
        !productCode ? COLUMN_LABELS.productCode : undefined,
        !latinName ? COLUMN_LABELS.latinName : undefined,
        Number.isNaN(quantity) ? COLUMN_LABELS.quantity : undefined,
        Number.isNaN(price) ? COLUMN_LABELS.price : undefined,
        Number.isNaN(totalPrice) ? COLUMN_LABELS.totalPrice : undefined,
        !store ? COLUMN_LABELS.store : undefined,
      ].filter(Boolean);

      if (invalidFields.length) {
        errors.push({ row: rowNumber, message: `Invalid or missing fields: ${invalidFields.join(', ')}` });
        return;
      }
      rows.push({ rowNumber, productCode, latinName, quantity, unit, price, totalPrice, store });
    });

    if (!rows.length) throw new BadRequestException('No valid inventory rows were found in the workbook');
    return { rows, errors };
  }

  private async readWorkbook(buffer: Buffer, fileName: string) {
    if (fileName.toLowerCase().endsWith('.xls')) {
      try {
        return this.readLegacyXls(buffer);
      } catch (error) {
        this.throwParseError(error);
      }
    }

    try {
      return await this.readXlsx(buffer);
    } catch (xlsxError) {
      try {
        return this.readLegacyXls(buffer);
      } catch {
        this.throwParseError(xlsxError);
      }
    }
  }

  private throwParseError(error: unknown): never {
    if (error instanceof BadRequestException) throw error;
    const detail = error instanceof Error ? error.message : 'Unknown parser error';
    throw new BadRequestException(`Excel file could not be parsed: ${detail}`);
  }

  private async readXlsx(buffer: Buffer): Promise<unknown[][]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Workbook does not contain a worksheet');

    const matrix: unknown[][] = [];
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      matrix[rowNumber - 1] = values;
    });
    return matrix;
  }

  private readLegacyXls(buffer: Buffer): unknown[][] {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new BadRequestException('Workbook does not contain a worksheet');
    return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1, defval: '', raw: false }) as unknown[][];
  }

  private findHeader(matrix: unknown[][]) {
    let best: { rowNumber: number; columns: Map<ColumnKey, number>; score: number } | null = null;
    const maxHeaderRows = Math.min(matrix.length, 25);
    for (let rowIndex = 0; rowIndex < maxHeaderRows; rowIndex += 1) {
      const columns = new Map<ColumnKey, number>();
      matrix[rowIndex]?.forEach((cell, columnIndex) => {
        const key = this.matchColumn(this.toText(cell));
        if (key && !columns.has(key)) columns.set(key, columnIndex);
      });
      const score = REQUIRED_COLUMNS.filter((key) => columns.has(key)).length + (columns.has('totalPrice') ? 0.5 : 0);
      if (!best || score > best.score) best = { rowNumber: rowIndex + 1, columns, score };
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

  private toText(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'object') {
      if ('result' in value) return this.toText(value.result);
      if ('text' in value) return String(value.text ?? '').trim();
      if ('richText' in value && Array.isArray(value.richText)) return value.richText.map((part: { text?: string }) => part.text ?? '').join('').trim();
      if (value instanceof Date) return value.toISOString();
    }
    return String(value).trim();
  }

  private toNumber(value: unknown) {
    if (typeof value === 'number') return value;

    let text = this.toText(value).replace(/[^\d,.-]/g, '');
    if (!text) return Number.NaN;
    const lastComma = text.lastIndexOf(',');
    const lastDot = text.lastIndexOf('.');

    if (lastComma >= 0 && lastDot >= 0) {
      text = lastComma > lastDot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
    } else if (lastComma >= 0) {
      const decimalDigits = text.length - lastComma - 1;
      text = decimalDigits > 0 && decimalDigits <= 2 ? text.replace(',', '.') : text.replace(/,/g, '');
    }

    return Number(text);
  }
}
