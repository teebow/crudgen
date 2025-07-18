import { pascalCase } from "change-case";
import { FormSchema } from "./generate-inputs";
import { ignoreDefaultDateFields } from "../utils/ignore-field";

export function generateEntityForm(
  entityName: string,
  formFields: string,
  formSchema: FormSchema
): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();
  const additionnalImports: string[] = [];
  // Generate default values for the form based on the schema fields
  const defaultValues = ignoreDefaultDateFields(formSchema.fields)
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      if (field.type === "date")
        additionnalImports.push(
          `import { parseDate } from "@internationalized/date";`
        );
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
      } else if (field.type === "text") {
        return `${field.name}: "",`;
      } else {
        return `${field.name}: [],`;
      }
    })
    .filter(Boolean)
    .join("\n");

  // This function generates a React component for a form based on the entity name.
  const code = `
  ${additionnalImports.join("\n")}  
import type { ${entityCapitalized}Dto } from "@dto/${entityLower}/dto/${entityLower}.dto";
import type { ${entityCapitalized} } from '@dto/${entityLower}/entities/${entityLower}.entity';

type ${entityCapitalized}FormProps = {
    onCancel?: () => void;
    onSubmit: (${entityLower}: ${entityCapitalized}) => void;
    showCancel?: boolean;
    ${entityLower}: ${entityCapitalized}Dto | null;
};

export default function ${entityCapitalized}Form({
    ${entityLower},
    onCancel,
    onSubmit,
    showCancel,
}: ${entityCapitalized}FormProps) {
    const form = useForm<${entityCapitalized}>({
        defaultValues: ${entityLower} ?? {
        ${defaultValues}
        },
    });

    
    return (
     <Form {...form}>
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full justify-center items-center"
            id="${entityLower}-form"
        >
            
               ${formFields}

                <div className="flex gap-4">
                    {showCancel && (
                      <Button variant="secondary" onClick={onCancel}>
                        Cancel
                      </Button>
                    )}
                    <Button variant="default" type="submit" form="${entityLower}-form" className="w-full">
                        {!form.formState.isSubmitting && <Check />}
                        {${entityLower} ? "Update" : "Create"}
                    </Button>
                </div>
            
            </form>
        </Form>
    );
}
`;
  return code;
}
