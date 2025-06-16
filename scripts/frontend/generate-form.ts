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
      } else {
        return `${field.name}: "",`;
      }
    })
    .filter(Boolean)
    .join("\n");

  // This function generates a React component for a form based on the entity name.
  const code = `
  ${additionnalImports.join("\n")}
import type { ${entityCapitalized}Dto } from "@dto/${entityLower}/dto/${entityLower}.dto";

type ${entityCapitalized}FormProps = {
    onCancel?: () => void;
    onSubmit: (${entityLower}: ${entityCapitalized}Dto) => void;
    showCancel?: boolean;
    ${entityLower}: ${entityCapitalized}Dto | null;
};

export default function ${entityCapitalized}Form({
    ${entityLower},
    onCancel,
    onSubmit,
    showCancel,
}: ${entityCapitalized}FormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<${entityCapitalized}Dto>({
        defaultValues: ${entityLower} ?? {
        ${defaultValues}
        },
    });

    
    return (
        <Form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full justify-center items-center space-y-4"
            id="${entityLower}-form"
        >
            <div className="flex flex-col  w-full">
               ${formFields}

                <div className="flex gap-4">
                    {showCancel && (
                        <Button variant="flat" onPress={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        color="primary"
                        type="submit"
                        form="${entityLower}-form"
                        className="w-full"
                        isLoading={isSubmitting}
                        startContent={!isSubmitting && <Icon icon="lucide:check" />}
                    >
                        {${entityLower} ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </Form>
    );
}
`;
  return code;
}
