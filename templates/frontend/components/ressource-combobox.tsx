import React, { useMemo } from "react";
import MultipleSelector from "./combobox";
import type { Option } from "./combobox";
import { useData } from "../core/context/use-data";
import { Skeleton } from "./ui/skeleton";
import type { DataContextType } from "@/core/context/DataContext";
import { intersectObjectsWithId, isNumberArray } from "@/utils/array-utils";
import type { UseQueryResult } from "@tanstack/react-query";

interface RessourceComboboxProps {
  resource: keyof DataContextType; // e.g., 'user', 'post'
  value?: Option[] | number[];
  onChange?: (options: Option[]) => void;
  placeholder?: string;
  idKey?: string; // which key to use as id, default 'id'
  labelKey?: string; // which key to use as label, default 'name'
  valueKey?: string; // which key to use as value, default 'id'
  disabled?: boolean;
  maxSelected?: number;
}

function findFirstStringProperty(
  item: Record<string, any>,
  excludeKeys: string[] = ["id"]
): string {
  for (const key in item) {
    if (
      typeof item[key] === "string" &&
      !excludeKeys.includes(key.toLowerCase())
    ) {
      return key;
    }
  }
  return "";
}

const RessourceCombobox: React.FC<RessourceComboboxProps> = ({
  resource,
  value,
  onChange,
  placeholder = "Select...",
  labelKey = "name",
  valueKey = "value",
  idKey = "id",
  disabled,
  maxSelected,
}) => {
  const { [resource]: ctx } = useData();
  const { data, isLoading } = ctx.useList() as UseQueryResult<unknown[], Error>;

  const options = useMemo<Option[]>(() => {
    if (isLoading || !Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: parseInt(item[idKey] ?? item[valueKey] ?? ""),
      value: String(
        item[valueKey] ?? item[findFirstStringProperty(item, [idKey])]
      ),
      label: String(
        item[labelKey] ??
          item[valueKey] ??
          item[findFirstStringProperty(item, [idKey])]
      ),
    }));
  }, [isLoading, data, labelKey, valueKey, idKey]);
  if (value && value.length > 0 && isNumberArray(value)) {
    value = intersectObjectsWithId<Option, number>(options, value);
  }

  console.log("RessourceCombobox options:", options);

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
