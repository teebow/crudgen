import { pascalCase } from "change-case";
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
  content: string,
  required?: boolean
) {
  const requiredSymbol = required
    ? '<p className="text-destructive">*</p>'
    : "";
  return ` <FormField
            key="${name}"
            name="${name}"
            control={form.control}
            ${validationRules}
            render={({ field }) => (
              <FormItem>
                <FormLabel>${pascalCase(name)} ${requiredSymbol}</FormLabel>
                <FormControl>
                ${content}
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />`;
}

export function renderInputField(field: FormField) {
  return `<Input {...field}  placeholder={field.name} />`;
}
export function renderRelationCombobox(field: FormField) {
  return `<RessourceCombobox {...field} resource="${field.name}" idKey="id" labelKey="${field.label}" valueKey="${field.label}" />`;
}

export function renderTextareaField(field: FormField) {
  return `<Textarea
        {...field}  placeholder={field.name} />`;
}

export function renderSelectField(field: FormField) {
  const options = field.options
    ?.map(
      (opt) => `  <SelectItem value="${opt.value}">${opt.label}</SelectItem>`
    )
    .join("\n");

  return ` <Select {...field} onValueChange={field.onChange} defaultValue={field.value} className="mb-4">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={field.field.name} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  ${options}
                </SelectContent>
              </Select>`;
}

export function renderCheckboxField(field: FormField) {
  return `<div className="mb-4">
      <Checkbox
       {...field}
      >
        ${field.label}
      </Checkbox>
    </div>`;
}

export function renderDateField(field: FormField) {
  return `<div className="mb-4">
      <DatePicker
        {...field}
      />
    </div>`;
}

export function renderDefaultField(field: FormField) {
  return `<Input
     {...field}
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
      `import { useForm } from "react-hook-form";`;
    const importForm = () =>
      `import { Form, FormField, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';`;
    const importTextarea = () =>
      `import { Textarea } from "@/components/ui/textarea";`;
    const importInput = () => `import { Input } from "@/components/ui/input";`;
    const importButton = () =>
      `import { Button } from "@/components/ui/button";`;
    const importSelect = () =>
      `import { Select, SelectItem } from "@/components/ui/select";`;
    const importCheckbox = () =>
      `import { Checkbox } from "@/components/ui/checkbox";`;
    const importDatePicker = () =>
      `import { DatePicker } from "@/components/ui/date-picker";`;
    const importRelationCombobox = () =>
      `import  RessourceCombobox  from "@/components/ressource-combobox";`;
    const importIcon = () => `import { Check } from 'lucide-react';`;
    const imports = new Set<string>([
      //importReact(),
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
            imports.add(importInput());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderInputField(field),
              field.required
            );
          case "textarea":
            imports.add(importTextarea());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderTextareaField(field),
              field.required
            );
          case "select":
            imports.add(importSelect());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderSelectField(field),
              field.required
            );
          case "checkbox":
            imports.add(importCheckbox());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderCheckboxField(field),
              field.required
            );
          case "date":
            imports.add(importDatePicker());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderDateField(field),
              field.required
            );
          default:
            imports.add(importRelationCombobox());
            return ReactHookFromControllerWrapper(
              field.name,
              rules,
              renderRelationCombobox(field),
              field.required
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
