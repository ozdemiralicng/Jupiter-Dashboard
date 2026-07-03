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

const REQUIRED_COLUMNS = ['Product Code', 'Latin Name', 'Quantity', 'Price', 'Total Price', 'Store'];

@Injectable()
export class ImportParserService {
  async parse(buffer: Buffer): Promise<ParsedImport> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('Workbook does not contain a worksheet');

    const header = sheet.getRow(1);
    const columns = new Map<string, number>();
    header.eachCell((cell, col) => columns.set(String(cell.value ?? '').trim(), col));
    const missing = REQUIRED_COLUMNS.filter((name) => !columns.has(name));
    if (missing.length) throw new BadRequestException(`Missing required columns: ${missing.join(', ')}`);

    const rows: ParsedInventoryRow[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const read = (name: string) => row.getCell(columns.get(name) ?? 0).value;
      const productCode = String(read('Product Code') ?? '').trim();
      const latinName = String(read('Latin Name') ?? '').trim();
      const quantity = Number(read('Quantity'));
      const price = Number(read('Price'));
      const totalPrice = Number(read('Total Price'));
      const store = String(read('Store') ?? '').trim();
      const unit = columns.has('Unit') ? String(read('Unit') ?? '').trim() : undefined;

      if (!productCode && !latinName && !store) return;
      if (!productCode || !latinName || !store || Number.isNaN(quantity) || Number.isNaN(price) || Number.isNaN(totalPrice)) {
        errors.push({ row: rowNumber, message: 'Required text or numeric value is invalid' });
        return;
      }
      rows.push({ rowNumber, productCode, latinName, quantity, unit, price, totalPrice, store });
    });

    return { rows, errors };
  }
}
