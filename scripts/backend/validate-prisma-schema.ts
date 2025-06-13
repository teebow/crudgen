export function checkModelsHaveTimestampsColumns(schemaContent: string) {
    const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/g;
    let match;
    const missingFields: { model: string; fields: string[] }[] = [];
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const body = match[2];
      const requiredFields = ["createdAt", "updatedAt", "deletedAt"];
      const missing = requiredFields.filter(
        (field) => !new RegExp(`\\b${field}\\b`).test(body)
      );
      if (missing.length > 0) {
        missingFields.push({ model: modelName, fields: missing });
      }
    }
    if (missingFields.length > 0) {
      const msg = missingFields
        .map(
          (m) =>
            `Model "${m.model}" is missing fields: ${m.fields
              .map((f) => `"${f}"`)
              .join(", ")}`
        )
        .join("\n");
      throw new Error(
        `Some models are missing required timestamp fields:\n${msg}`
      );
    }
  }
