import { PrismaModel } from "../prisma-parser";

export function generateController(model: PrismaModel) {
  const entityName = model.name;
  const nameLower = entityName.toLowerCase();
  const code = `
    import {
      Controller,
      Get,
      Post,
      Body,
      Patch,
      Param,
      Delete,
      Query,
    } from '@nestjs/common';
    import { ${entityName}Service } from './${nameLower}.service';
    import { ${entityName}Dto, Create${entityName}Dto, Update${entityName}Dto, Create${entityName}Schema, Update${entityName}Schema,  Paginated${entityName}Dto  } from '@zod/${nameLower}.schema';
    import { QueryOptionsDto } from '@zod/common/query.schema';
    import { ZodPipe } from '@common/decorators/zod-decorator';
    import { Prisma } from '@prisma/client';
    
    @Controller('${nameLower}')
    export class ${entityName}Controller {
      constructor(private readonly ${nameLower}Service: ${entityName}Service) {}
    
      @Post()
      @ZodPipe(Create${entityName}Schema)
      create(@Body() create${entityName}Dto: Create${entityName}Dto):Promise<${entityName}Dto> {
        return this.${nameLower}Service.create(create${entityName}Dto as Prisma.${entityName}CreateInput);
      }
    
      @Get()
      findAll(@Query() query: QueryOptions):Promise<Paginated${entityName}Dto> {
        return this.${nameLower}Service.findAll(query);
      }
    
      @Get(':id')
      findOne(@Param('id') id: string):Promise<${entityName}Dto | null> {
        return this.${nameLower}Service.findOne(+id);
      }
    
      @Patch(':id')
      @ZodPipe(Update${entityName}Schema)
      update(@Param('id') id: string, @Body() update${entityName}Dto: Update${entityName}Dto):Promise<${entityName}Dto> {
        return this.${nameLower}Service.update(+id, update${entityName}Dto as Prisma.${entityName}UpdateInput);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string):Promise<${entityName}Dto> {
        return this.${nameLower}Service.remove(+id);
      }
    }
    
    `;

  return code;
}
