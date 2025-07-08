import React, { useMemo } from 'react';
import MultipleSelector from './combobox';
import type { Option } from './combobox';
import { useData } from '../core/context/use-data';
import { Skeleton } from './ui/skeleton';

interface RessourceComboboxProps {
  resource: 'user' | 'post'; // e.g., 'user', 'post'
  value?: Option[];
  onChange?: (options: Option[]) => void;
  placeholder?: string;
  idKey?: string; // which key to use as id, default 'id'
  labelKey?: string; // which key to use as label, default 'name'
  valueKey?: string; // which key to use as value, default 'id'
  disabled?: boolean;
  maxSelected?: number;
}

const RessourceCombobox: React.FC<RessourceComboboxProps> = ({
  resource,
  value,
  onChange,
  placeholder = 'Select...',
  labelKey = 'name',
  valueKey = 'value',
  idKey = 'id',
  disabled,
  maxSelected,
}) => {
  const { [resource]: ctx } = useData();
  const { data, isLoading } = ctx.useList();

  const options = useMemo<Option[]>(() => {
    if (isLoading || !Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: String(item[idKey] ?? item[valueKey] ?? ''),
      value: String(item[valueKey] ?? ''),
      label: String(item[labelKey] ?? item[valueKey] ?? ''),
    }));
  }, [isLoading, data, labelKey, valueKey, idKey]);

  console.log('RessourceCombobox options:', options);

  return isLoading ? (
    <Skeleton className="h-10 w-full" />
  ) : (
    // If loading, show a skeleton loader

    <MultipleSelector
      value={value}
      onChange={onChange}
      defaultOptions={options}
      emptyIndicator={<span>Aucun résultat</span>}
      placeholder={placeholder}
      disabled={isLoading || disabled}
      maxSelected={maxSelected}
    />
  );
};

export default RessourceCombobox;
