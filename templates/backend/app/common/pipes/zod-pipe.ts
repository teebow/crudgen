import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import z, { ZodError, ZodType } from 'zod';

type Dto = Record<string, unknown>;

@Injectable()
export class ZodValidationPipe<T = unknown, U = unknown>
  implements PipeTransform<T, U>
{
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: T, metadata: ArgumentMetadata): U {
    try {
      if (metadata.type !== 'body') return value as unknown as U;
      const parsedValue = this.schema.parse(value);
      console.log(parsedValue);
      const result = transformRelations(parsedValue as Dto) as U;
      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        throw new BadRequestException(
          'Validation failed',
          z.prettifyError(error),
        );
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

function prismaConnectFromIds<T extends string | number>(
  ids?: T[],
): { connect: { id: T }[] } | undefined {
  return ids?.length ? { connect: ids.map((id) => ({ id })) } : undefined;
}

export function transformRelations(dto: Dto): Dto {
  const result: Dto = {};

  for (const [key, value] of Object.entries(dto)) {
    // 1. authorId -> author.connect.id
    if (key.endsWith('Id') && typeof value === 'number') {
      const relationName = key.slice(0, -'Id'.length);
      result[relationName] = { connect: { id: value } };

      // 2. tags (array of numbers) -> tags.connect[]
    } else if (
      Array.isArray(value) &&
      value.every((v): v is number => typeof v === 'number')
    ) {
      result[key] = prismaConnectFromIds(value);

      // 3. passthrough other fields
    } else {
      result[key] = value;
    }
  }

  return result;
}
