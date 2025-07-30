import { useCallback } from 'react';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import type { QueryOptionsDto } from '@zod/common/query.schema';

interface UseTableActionsProps<T> {
  setQueryOptions: React.Dispatch<React.SetStateAction<QueryOptionsDto>>;
  setSelectedItem: React.Dispatch<React.SetStateAction<T | null>>;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseTableActionsReturn<T> {
  handleAddNew: () => void;
  handleEdit: (row: { original: T }) => void;
  handleDrawerClose: () => void;
  handleSortingChange: (sorting: SortingState) => void;
  handleFilterChange: (filters: ColumnFiltersState) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
}

export function useTableActions<T = any>({
  setQueryOptions,
  setSelectedItem,
  setOpenDrawer,
}: UseTableActionsProps<T>): UseTableActionsReturn<T> {
  const handleAddNew = useCallback(() => {
    setSelectedItem(null);
    setOpenDrawer(true);
  }, [setSelectedItem, setOpenDrawer]);

  const handleEdit = useCallback(
    (row: { original: T }) => {
      setSelectedItem(row.original);
      setOpenDrawer(true);
    },
    [setSelectedItem, setOpenDrawer]
  );

  const handleDrawerClose = useCallback(() => {
    setOpenDrawer(false);
  }, [setOpenDrawer]);

  const handleSortingChange = useCallback(
    (sorting: SortingState) => {
      if (!sorting.length) return;

      const { id, desc } = sorting[0];
      setQueryOptions((prev) => ({
        ...prev,
        sortBy: id,
        sortOrder: desc ? 'desc' : 'asc',
      }));
    },
    [setQueryOptions]
  );

  const handleFilterChange = useCallback(
    (filters: ColumnFiltersState) => {
      const formattedFilters = Object.assign(
        {},
        ...filters.map((filter) => ({
          [filter.id]: { contains: filter.value },
        }))
      );

      setQueryOptions((prev) => ({
        ...prev,
        filters: JSON.stringify(formattedFilters),
      }));
    },
    [setQueryOptions]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setQueryOptions((prev) => ({ ...prev, page }));
    },
    [setQueryOptions]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      setQueryOptions((prev) => ({ ...prev, limit }));
    },
    [setQueryOptions]
  );

  return {
    handleAddNew,
    handleEdit,
    handleDrawerClose,
    handleSortingChange,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
  };
}
