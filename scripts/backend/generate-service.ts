import { PrismaModel } from "../prisma-parser";

export function generateService(model: PrismaModel) {
  const entityName = model.name;
  const nameLower = entityName.toLowerCase();
  const code = `import { Injectable } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { Prisma } from '@prisma/client';
  import { buildPrismaPagination, buildPrismaWhere } from 'src/utils/query-utils';
  import { paginatedFindAll } from '@common/prisma/paginated-find-all';
  import { QueryOptionsDto } from '@zod/common/query.schema';
  
  @Injectable()
  export class ${entityName}Service {
    constructor(private prisma: PrismaService) {}


    findAll(dto: QueryOptions) {
      return paginatedFindAll<'${entityName}'>(dto, this.prisma.${nameLower});
    }
  
    findOne(id: number) {
      return this.prisma.${nameLower}.findUnique({ where: { id } });
    }
  
    create(data: Prisma.${entityName}CreateInput) {
      return this.prisma.${nameLower}.create({ data });
    }
  
    update(id: number, data: Prisma.${entityName}UpdateInput) {
      return this.prisma.${nameLower}.update({ where: { id }, data });
    }
  
    remove(id: number) {
      return this.prisma.${nameLower}.delete({ where: { id } });
    }
  }
    `;
  return code;
}
