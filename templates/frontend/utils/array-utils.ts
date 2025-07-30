export function isNumberArray(arr: unknown): arr is number[] {
  return Array.isArray(arr) && arr.every((item) => typeof item === "number");
}

export function intersectObjectsWithId<T extends { id: number | string }, U>(
  array1: T[] = [],
  array2: U[] = []
): T[] {
  const ids2 = new Set(array2.map((id) => id));
  console.log(array1.filter((item) => ids2.has(item.id)));
  return array1.filter((item) => ids2.has(item.id));
}
