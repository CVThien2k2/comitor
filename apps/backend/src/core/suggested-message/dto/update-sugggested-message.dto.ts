import { PartialType } from "@nestjs/swagger"
import { CreateSuggestedMessageDto } from "./create-suggested-message.dto"

export class UpdateSuggestedMessageDto extends PartialType(CreateSuggestedMessageDto) {}