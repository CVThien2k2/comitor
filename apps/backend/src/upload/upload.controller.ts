import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard"
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
@UseGuards(JwtAuthGuard)
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: "Get presigned upload URL" })
  @ApiOkResponse({ type: ApiResponseOf(PresignedEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("presign")
  @HttpCode(HttpStatus.OK)
  async presign(@Body() body: CreatePresignedDto) {
    const data = await this.uploadService.getPresignedPutUrl({
      folder: body.folder,
      filename: body.filename,
      contentType: body.contentType,
    })
    return { message: "Presigned URL created successfully", data }
  }

  @ApiOperation({ summary: "Get presigned upload URLs in batch" })
  @ApiOkResponse({ type: ApiResponseOfArray(PresignedEntity) })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("presign-batch")
  @HttpCode(HttpStatus.OK)
  async presignBatch(@Body() body: CreatePresignedBatchDto) {
    const data = await this.uploadService.getPresignedPutUrlsBatch({
      folder: body.folder,
      files: body.files,
    })
    return { message: "Presigned URLs created successfully", data }
  }

  @ApiOperation({ summary: "Delete a file from S3" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("delete")
  @HttpCode(HttpStatus.OK)
  async delete(@Body() body: DeleteFileDto) {
    await this.uploadService.delete(body.key)
    return { message: "File deleted successfully" }
  }

  @ApiOperation({ summary: "Delete multiple files from S3" })
  @ApiOkResponse({ type: MessageResponseEntity })
  @ApiBadRequestResponse({ type: BadRequestEntity })
  @ApiUnauthorizedResponse({ type: UnauthorizedEntity })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorEntity })
  @Post("delete-batch")
  @HttpCode(HttpStatus.OK)
  async deleteBatch(@Body() body: DeleteFileBatchDto) {
    await this.uploadService.deleteBatch(body.keys.map((item) => item.key))
    return { message: "Files deleted successfully" }
  }
}
