import { UsePipes } from '@nestjs/common';
import { ZodType } from 'zod';
import { ZodValidationPipe } from '@common/pipes/zod-pipe';

export const ZodPipe = (schema: ZodType) =>
  UsePipes(new ZodValidationPipe(schema));
