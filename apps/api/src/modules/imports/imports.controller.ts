import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportsService } from './imports.service';

@ApiBearerAuth()
@ApiTags('Imports')
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('preview')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  preview(@UploadedFile() file?: Express.Multer.File) {
    return this.imports.preview(file);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  import(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: AuthUser) {
    return this.imports.import(file, user.sub);
  }

  @Get()
  list() {
    return this.imports.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.imports.details(id);
  }
}
