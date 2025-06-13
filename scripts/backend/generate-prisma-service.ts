/**
 * Generates the source code for a NestJS PrismaService class as a string.
 *
 * The generated service extends `PrismaClient` and implements `OnModuleInit` to establish a database connection
 * and set up Prisma middlewares for soft delete functionality. The middlewares:
 * - Intercept `delete` and `deleteMany` actions to perform a soft delete by updating the `deletedAt` field instead of removing records.
 * - Filter out soft-deleted records (where `deletedAt` is not `null`) from `findUnique`, `findFirst`, and `findMany` queries by default.
 *
 * @returns {string} The TypeScript source code for the PrismaService class with soft delete logic.
 */
export function generatePrismaService(): string {
  const serviceContent = `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/*
 * The service extends \`PrismaClient\` and implements \`OnModuleInit\` to establish a database connection
 * and set up Prisma middlewares for soft delete functionality. The middlewares:
 * - Intercept \`delete\` and \`deleteMany\` actions to perform a soft delete by updating the \`deletedAt\` field instead of removing records.
 * - Filter out soft-deleted records (where \`deletedAt\` is not \`null\`) from \`findUnique\`, \`findFirst\`, and \`findMany\` queries by default.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    
    // Add soft delete middleware
    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.action === 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      
      if (params.action === 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = { deletedAt: new Date() };
        }
      }
      
      return next(params);
    });

    // Add filter for soft deleted records
    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change to findFirst - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'findFirst';
        // Add 'deletedAt' filter
        // ID filter maintained
        params.args.where['deletedAt'] = null;
      }
      
      if (params.action === 'findMany') {
        // Find many queries
        if (params.args.where) {
          if (params.args.where.deletedAt == undefined) {
            // Exclude deleted records if deletedAt is not already specified
            params.args.where['deletedAt'] = null;
          }
        } else {
          params.args['where'] = { deletedAt: null };
        }
      }
      
      return next(params);
    });
  }
}`;
  return serviceContent;
}
