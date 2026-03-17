import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import {
  ApiResponseOf,
  ApiResponseOfArray,
  MessageResponseEntity,
  BadRequestEntity,
  UnauthorizedEntity,
  InternalServerErrorEntity,
} from "src/common/entities/api-response.entity"
import { UploadService } from "./upload.service"
import { CreatePresignedDto } from "./dto/create-presigned.dto"
import { CreatePresignedBatchDto } from "./dto/create-presigned-batch.dto"
import { DeleteFileDto, DeleteFileBatchDto } from "./dto/delete-file.dto"
import { PresignedEntity } from "./entities/upload.entity"

@ApiTags("Upload")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: UnauthorizedEntity })
@ApiBadRequestResponse({ type: BadRequestEntity })
@ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: "Tạo presigned URL để upload" })
  @ApiOkResponse({ type: ApiResponseOf(PresignedEntity) })
  @Post("presign")
  @HttpCode(HttpStatus.OK)
  async presign(@Body() body: CreatePresignedDto) {
    const data = await this.uploadService.getPresignedPutUrl({
      folder: body.folder,
      filename: body.filename,
      contentType: body.contentType,
    })
    return { message: "Tạo presigned URL thành công", data }
  }

  @ApiOperation({ summary: "Tạo danh sách presigned URL để upload" })
  @ApiOkResponse({ type: ApiResponseOfArray(PresignedEntity) })
  @Post("presign-batch")
  @HttpCode(HttpStatus.OK)
  async presignBatch(@Body() body: CreatePresignedBatchDto) {
    const data = await this.uploadService.getPresignedPutUrlsBatch({
      folder: body.folder,
      files: body.files,
    })
    return { message: "Tạo danh sách presigned URL thành công", data }
  }

  @ApiOperation({ summary: "Xóa tệp trên S3" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Post("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Body() body: DeleteFileDto) {
    await this.uploadService.delete(body.key)
    return { message: "Xóa tệp thành công" }
  }

  @ApiOperation({ summary: "Xóa nhiều tệp trên S3" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @Post("delete-batch")
  @HttpCode(HttpStatus.OK)
  async deleteBatch(@Body() body: DeleteFileBatchDto) {
    await this.uploadService.deleteBatch(body.keys.map((item) => item.key))
    return { message: "Xóa danh sách tệp thành công" }
  }
}
