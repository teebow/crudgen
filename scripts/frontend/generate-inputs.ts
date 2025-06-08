// Define types for the form schema
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  description?: string;
  errorMessage?: string;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
}

export function renderInputField(field: FormField) {
  return `<Input
      id="${field.name}"
      name="${field.name}"
      label="${field.label}"
      type="${field.type}"
      placeholder="${field.placeholder || ""}"
      isRequired={${field.required || false}}
      value={formState["${field.name}"] || ""}
      onValueChange={(value) => handleChange("${field.name}", value)}
      className="mb-4"
    />`;
}

export function renderTextareaField(field: FormField) {
  return `<Textarea
      id="${field.name}"
      name="${field.name}"
      label="${field.label}"
      placeholder="${field.placeholder || ""}"
      isRequired={${field.required || false}}
      value={formState["${field.name}"] || ""}
      onValueChange={(value) => handleChange("${field.name}", value)}
      className="mb-4"
    />`;
}

export function renderSelectField(field: FormField) {
  const options = field.options
    ?.map(
      (opt) =>
        `  <SelectItem key="${opt.value}" value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return `<Select
      id="${field.name}"
      name="${field.name}"
      label="${field.label}"
      isRequired={${field.required || false}}
      onChange={(e) => handleChange("${field.name}", e.target.value)}
      className="mb-4"
    >
    ${options}
    </Select>`;
}

export function renderCheckboxField(field: FormField) {
  return `<div className="mb-4">
      <Checkbox
        id="${field.name}"
        name="${field.name}"
        isSelected={!!formState["${field.name}"]}
        onValueChange={(checked) => handleChange("${field.name}", checked)}
      >
        ${field.label}
      </Checkbox>
    </div>`;
}

export function renderDateField(field: FormField) {
  return `<div className="mb-4">
      <DatePicker
        id="${field.name}"
        name="${field.name}"
        label="${field.label}"
        isRequired={${field.required || false}}
      />
    </div>`;
}

export function renderDefaultField(field: FormField) {
  return `<Input
      id="${field.name}"
      name="${field.name}"
      label="${field.label}"
      type="text"
      isRequired={${field.required || false}}
      value={formState["${field.name}"] || ""}
      onValueChange={(value) => handleChange("${field.name}", value)}
      className="mb-4"
    />`;
}

export function renderForm(
  schema: FormSchema,
  stateAndHandlers: string,
  formFields: string
) {
  return `export default function ${schema.title.replace(/\s+/g, "")}Form() {
  ${stateAndHandlers}

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">${schema.title}</h2>
      ${
        schema.description
          ? `<p className="text-default-600 mb-6">${schema.description}</p>`
          : ""
      }
      
      <Form onSubmit={handleSubmit} className="space-y-2">
        ${formFields}
        
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            startContent={!isSubmitting && <Icon icon="lucide:check" />}
          >
            ${schema.submitButtonText || "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );`;
}

export default function generateForm(schema: FormSchema) {
  // Create imports section
  const importReact = () => `import React from "react";`;
  const importForm = () => `import { Form } from "@heroui/form";`;
  const importInputTextarea = () =>
    `import { Input, Textarea } from "@heroui/input";`;
  const importButton = () => `import { Button } from "@heroui/button";`;
  const importSelect = () =>
    `import { Select, SelectItem } from "@heroui/select";`;
  const importCheckbox = () => `import { Checkbox } from "@heroui/checkbox";`;
  const importDatePicker = () =>
    `import { DatePicker } from "@heroui/date-picker";`;
  const importIcon = () => `import { Icon } from "@iconify/react";`;
  const imports = new Set<string>([
    importReact(),
    importForm(),
    importButton(),
  ]);

  // Generate form fields based on schema
  const formFields = schema.fields
    .filter((f: { name: string }) => f.name !== "id")
    .map((field) => {
      // Extracted field renderers
      switch (field.type) {
        case "text":
        case "email":
        case "password":
        case "tel":
        case "url":
        case "number":
          imports.add(importInputTextarea());
          return renderInputField(field);
        case "textarea":
          imports.add(importInputTextarea());
          return renderTextareaField(field);
        case "select":
          imports.add(importSelect());
          return renderSelectField(field);
        case "checkbox":
          imports.add(importCheckbox());
          return renderCheckboxField(field);
        case "date":
          imports.add(importDatePicker());
          return renderDateField(field);
        default:
          imports.add(importInputTextarea());
          return renderDefaultField(field);
      }
    })
    .join("\n\n");

  // Assemble the complete component
  // Extracted function to assemble the complete component
  // function assembleComponentCode(
  //   imports: Set<string>,
  //   schema: FormSchema,
  //   stateAndHandlers: string,
  //   formFields: string
  // ) {
  //   return `
  //   ${Array.from(imports).join("\n")}
  //   ${renderForm(schema, stateAndHandlers, formFields)}
  //   `;
  // }
  return { imports, formFields };
}
