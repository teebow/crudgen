import { PrismaModel } from "../prisma-parser";

export function generateService(model:PrismaModel){
    const entityName = model.name;
    const nameLower = entityName.toLowerCase();
    const code = 
 `import { Injectable } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { Prisma } from '@prisma/client';
  import { buildPrismaPagination, buildPrismaWhere } from 'src/utils/query-utils';
  import { QueryOptions } from '@dto/common/query.dto';
  
  @Injectable()
  export class ${entityName}Service {
    constructor(private prisma: PrismaService) {}


    findAll(dto: QueryOptions) {
      const where = buildPrismaWhere<'${entityName}'>(dto);
      const { skip, take, orderBy } = buildPrismaPagination(dto); 
      const include = dto.include
      ? (JSON.parse(dto.include) as Prisma.${entityName}Include)
      : undefined;
      return this.prisma.${nameLower}.findMany({ where, skip, take, orderBy, include });
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
