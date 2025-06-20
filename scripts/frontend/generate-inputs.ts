import { ignoreDefaultDateFields } from "../utils/ignore-field";
import { generateEntityForm } from "./generate-form";

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

function ReactHookFromControllerWrapper(
  name: string,
  validationRules: string,
  content: string
) {
  return ` <Controller
            key="${name}"
            name="${name}"
            control={control}
            ${validationRules}
            render={({ field: { onChange, value } }) => (
              ${content}
            )}
          />`;
}

export function renderInputField(field: FormField) {
  return `<Input
        id="${field.name}"
        label="${field.label}"
        type="${field.type}"
        placeholder="${field.placeholder || ""}"
        isRequired={${field.required || false}}
        value={value || ""}
        onValueChange={onChange}
        isInvalid={!!errors.${field.name}}
        errorMessage={errors.${field.name}?.message}
        className="mb-4"
    />`;
}

export function renderTextareaField(field: FormField) {
  return `<Textarea
        id="${field.name}"
        label="${field.label}"
        placeholder="${field.placeholder || ""}"
        isRequired={${field.required || false}}
        value={value || ""}
        onValueChange={onChange}
        isInvalid={!!errors.${field.name}}
        errorMessage={errors.${field.name}?.message}
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
            label="${field.label}"
            isRequired={${field.required || false}}
            selectedKeys={value ? [value] : []}
            onChange={(e) => onChange(e.target.value)}
            isInvalid={!!errors.${field.name}}
            errorMessage={errors.${field.name}?.message}
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
        isSelected={!!value}
        onValueChange={onChange}
        isInvalid={!!errors.${field.name}}
      >
        ${field.label}
      </Checkbox>
    </div>`;
}

export function renderDateField(field: FormField) {
  return `<div className="mb-4">
      <DatePicker
        id="${field.name}"
              label="${field.label}"
              isRequired={${field.required || false}}
              value={value ? parseDate(value.toString()) : undefined}
              onChange={(date) => {
                if (date) {
                  onChange(date.toString());
                }
              }}
              isInvalid={!!errors.${field.name}}
              errorMessage={errors.${field.name}?.message}
      />
    </div>`;
}

export function renderDefaultField(field: FormField) {
  return `<Input
      id="${field.name}"
            label="${field.label}"
            type="text"
            isRequired={${field.required || false}}
            value={value || ""}
            onValueChange={onChange}
            isInvalid={!!errors.${field.name}}
            errorMessage={errors.${field.name}?.message}
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
      
      <Form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        ${formFields}
        
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            startContent={!isSubmitting && <Check  />}
          >
            ${schema.submitButtonText || "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );}`;
}

export default function generate(schema: FormSchema) {
  const entityName = schema.title.replace(/\s+/g, "");
  const lowerEntityName = entityName.toLowerCase();
  // Function to generate React code from schema
  const generateFormCode = (schema: FormSchema) => {
    // Create imports section
    const importReact = () => `import { useState } from "react";`;
    const importReactHookForm = () =>
      `import { useForm, Controller } from "react-hook-form";`;
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
      importReactHookForm(),
      importForm(),
      importButton(),
      importIcon(),
    ]);
    // Create form state and handlers
    const stateAndHandlers = `
        const { 
      control, 
      handleSubmit, 
      formState: { errors, isSubmitting }
    } = useForm({
      defaultValues: ${lowerEntityName} ?? {
        ${schema.fields
          .map((field) => {
            if (field.defaultValue !== undefined) {
              return `${field.name}: ${JSON.stringify(field.defaultValue)},`;
            } else if (field.type === "checkbox") {
              return `${field.name}: false,`;
            } else if (
              field.type === "select" &&
              field.options &&
              field.options.length > 0
            ) {
              return `${field.name}: "${field.options[0].value}",`;
            } else {
              return `${field.name}: "",`;
            }
          })
          .join("\n")}
      }
    });

    const onSubmit = (data) => {
      console.log("Form submitted:", data);
      // Add your submission logic here
    };`;

    // Generate form fields based on schema
    const formFields = ignoreDefaultDateFields(schema.fields)
      .map((field) => {
        const validationRules = [];
        if (field.required)
          validationRules.push(`required: "${field.label} is required"`);
        if (field.type === "email")
          validationRules.push(
            `pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: "Please enter a valid email address" }`
          );
        if (field.minLength)
          validationRules.push(
            `minLength: { value: ${field.minLength}, message: "Must be at least ${field.minLength} characters" }`
          );
        if (field.maxLength)
          validationRules.push(
            `maxLength: { value: ${field.maxLength}, message: "Must be at most ${field.maxLength} characters" }`
          );

        const rules =
          validationRules.length > 0
            ? `rules={{ ${validationRules.join(", ")} }}`
            : "";

        // Extracted field renderers
        switch (field.type) {
          case "text":
          case "email":
          case "password":
          case "tel":
          case "url":
          case "number":
            imports.add(importInputTextarea());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderInputField(field)
            );
          case "textarea":
            imports.add(importInputTextarea());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderTextareaField(field)
            );
          case "select":
            imports.add(importSelect());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderSelectField(field)
            );
          case "checkbox":
            imports.add(importCheckbox());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderCheckboxField(field)
            );
          case "date":
            imports.add(importDatePicker());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderDateField(field)
            );
          default:
            imports.add(importInputTextarea());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderDefaultField(field)
            );
        }
      })
      .join("\n\n");

    // Assemble the complete component
    // Extracted function to assemble the complete component
    function assembleComponentCode(
      imports: Set<string>,
      schema: FormSchema,
      stateAndHandlers: string,
      formFields: string
    ) {
      return `
      ${Array.from(imports).join("\n")}
      ${generateEntityForm(schema.title, formFields, schema)}
      `;
    }
    return assembleComponentCode(imports, schema, stateAndHandlers, formFields);
  };

  return generateFormCode(schema);
}
