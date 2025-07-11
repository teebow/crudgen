export interface QueryOptions  {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: string; //ex : JSON.stringify({ email: { equals: 'aazeaze' } }),
  include?: string; //ex : JSON.stringify({ posts: true })
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}