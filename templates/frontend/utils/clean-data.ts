export function cleanData<T>(data: Record<string, any>): T {
    return Object.fromEntries(
        Object.entries(data).filter(
            ([, value]) =>
                value != null && // covers both null and undefined
                (typeof value !== "string" || value.trim() !== "")
        )
    ) as T;
}
