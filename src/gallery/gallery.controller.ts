import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import LocalFilesInterceptor from 'src/localfiles/localFiles.interceptor';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}
  @Post()
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
      path: '/gallery',
    }),
  )
  async addAvatar(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return 'test';
  }
}
