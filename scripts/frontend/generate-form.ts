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
        return `${field.name}: null,`;
      } else {
        return `${field.name}: undefined,`;
      }
    })
    .filter(Boolean)
    .join("\n");
  //remove default ${defaultValues}
  // This function generates a React component for a form based on the entity name.
  const code = `
  ${additionnalImports.join("\n")}  
import type { Create${entityCapitalized}Dto, Update ${entityCapitalized}Dto,  ${entityCapitalized}Dto } from '@zod/${entityLower}.schema';
import type { ${entityCapitalized}FormDto } from './${entityLower}-form.type';

type ${entityCapitalized}FormProps = {
    onCancel?: () => void;
    onSubmit: (${entityLower}: ${entityCapitalized}FormDto ) => void;
    showCancel?: boolean;
    ${entityLower}: ${entityCapitalized}Dto | null;
};

export default function ${entityCapitalized}Form({
    ${entityLower},
    onCancel,
    onSubmit,
    showCancel,
}: ${entityCapitalized}FormProps) {
    const form = useForm<Update${entityCapitalized}Dto | Create${entityCapitalized}Dto>({
        defaultValues: ${entityLower} ?? {},
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
