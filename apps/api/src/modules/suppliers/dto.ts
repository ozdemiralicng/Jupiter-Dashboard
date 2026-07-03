import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

const optionalText = () => Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));

export class SupplierDto {
  @IsString()
  name!: string;

  @optionalText()
  @IsOptional()
  @IsEmail()
  email?: string;

  @optionalText()
  @IsOptional()
  @IsString()
  phone?: string;

  @optionalText()
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @optionalText()
  @IsOptional()
  @IsString()
  country?: string;

  @optionalText()
  @IsOptional()
  @IsString()
  notes?: string;
}
