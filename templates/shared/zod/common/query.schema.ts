import { z } from "zod";

export const queryOptionsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.union([z.literal("asc"), z.literal("desc")]).optional(),
  search: z.string().optional(),
  filters: z.string().optional(),
  include: z.string().optional(),
});

export type QueryOptionsDto = z.infer<typeof queryOptionsSchema>;

export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  });

// Type inference helper
export type PaginatedResult<T> = z.infer<
  ReturnType<typeof createPaginatedResultSchema<z.ZodType<T>>>
>;
