import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from '@zod/common/query.schema';
import { buildPrismaPagination, buildPrismaWhere } from 'src/utils/query-utils';

type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
};

export async function paginatedFindAll<T extends keyof Prisma.TypeMap['model']>(
  dto: QueryOptionsDto,
  entity: PrismaModel,
) {
  const model = entity;
  const { page = 1, limit = 10 } = dto;
  const where = buildPrismaWhere<T>(dto);
  const { skip, take, orderBy } = buildPrismaPagination(dto);
  const include = dto.include
    ? (JSON.parse(dto.include) as Record<string, any>)
    : undefined;
  // Exécuter les requêtes en parallèle
  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take, orderBy, include }),
    model.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1,
  };
}
