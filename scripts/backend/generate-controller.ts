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
    import { Create${entityName}Dto } from '@dto/${nameLower}/dto/create-${nameLower}.dto';
    import { Update${entityName}Dto } from '@dto/${nameLower}/dto/update-${nameLower}.dto';
    import { QueryOptions } from '@dto/common/query.dto';
    
    @Controller('${nameLower}')
    export class ${entityName}Controller {
      constructor(private readonly ${nameLower}Service: ${entityName}Service) {}
    
      @Post()
      create(@Body() create${entityName}Dto: Create${entityName}Dto) {
        return this.${nameLower}Service.create(create${entityName}Dto);
      }
    
      @Get()
      findAll(@Query() query: QueryOptions) {
        return this.${nameLower}Service.findAll(query);
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        return this.${nameLower}Service.findOne(+id);
      }
    
      @Patch(':id')
      update(@Param('id') id: string, @Body() update${entityName}Dto: Update${entityName}Dto) {
        return this.${nameLower}Service.update(+id, update${entityName}Dto);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        return this.${nameLower}Service.remove(+id);
      }
    }
    
    `;
    
    return code;
}