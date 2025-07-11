// utils/prisma-query-utils.ts
import { QueryOptions } from '@dto/common/query.dto';
import { Prisma } from '@prisma/client';

type WhereInput<T> = T extends { where: infer W } ? W : never;

export function buildPrismaWhere<T extends keyof Prisma.TypeMap['model']>(
  dto: QueryOptions,
): WhereInput<Prisma.TypeMap['model'][T]['operations']['findMany']> {
  const filters = dto.filters ? JSON.parse(dto.filters) : {};
  const where = {} as WhereInput<
    Prisma.TypeMap['model'][T]['operations']['findMany']
  >;
  const searchableFields = Object.keys(
    filters,
  ) as (keyof Prisma.TypeMap['model'][T]['payload']['scalars'])[];

  for (const filter of Object.keys(filters)) {
    if (searchableFields && searchableFields.includes(filter as any)) {
      const operator = Object.keys(filters[filter])[0] || 'equals';

      where[filter] = {
        [operator]:
          typeof filters[filter][operator] === 'string'
            ? filters[filter][operator]
            : String(filters[filter][operator]),
        mode: 'insensitive',
      };
    }
  }

  return where;
}

export function buildPrismaPagination<T extends keyof Prisma.TypeMap['model']>(
  dto: QueryOptions,
): {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
} {
  //console.log('buildPrismaPagination called with dto:', dto);
  const { page = 1, limit = 10, sortBy, sortOrder } = dto;
  const skip = (page - 1) * +limit;
  const take = +limit;

  const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : undefined;

  return { skip, take, orderBy };
}
