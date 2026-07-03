import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @IsString()
  name!: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsString()
  whatsapp?: string;
  @IsOptional()
  @IsString()
  country?: string;
  @IsOptional()
  @IsString()
  orderNotes?: string;
}
