import { pascalCase } from "change-case";

export function generateEntityForm(entityName: string, formFields:string): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();
  // This function generates a React component for a form based on the entity name.
  const code = `
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
            name: "",
            email: "",
        },
    });

    
    return (
        <Form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full justify-center items-center space-y-4"
            id="${entityLower}-form"
        >
            <div className="flex flex-col gap-4 w-full">
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
                        startContent={!isSubmitting && <Check />}
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
