import type { UserDto } from "@dto/user/dto/user.dto";
import { Button, Form, Input } from "@heroui/react";
import { Check } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useApi } from "../core/api/api-client";

type UserFormProps = {
  onCancel?: () => void;
  onSubmit?: (user: UserDto) => void;
  showCancel?: boolean;
  user: UserDto | null;
};

export default function UserForm({
  user,
  onCancel,
  onSubmit,
  showCancel,
}: UserFormProps) {
  const api = useApi("http://localhost:3000/user");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserDto>({
    defaultValues: user ?? {
      name: "",
      email: "",
    },
  });

  
  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full justify-center items-center space-y-4"
      id="user-form"
    >
      <div className="flex flex-col gap-4 w-full">
        <Controller
          key="name"
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <Input
              {...field}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message?.toString()}
            />
          )}
        />

        <Controller
          key="email"
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder=""
              isRequired={false}
              {...field}
              value={field.value ?? ""}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message?.toString()}
              className="mb-4"
            />
          )}
        />

        <div className="flex gap-4">
          {showCancel && (
            <Button variant="flat" onPress={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            color="primary"
            type="submit"
            form="user-form"
            className="w-full"
            isLoading={isSubmitting}
            startContent={!isSubmitting && <Check />}
          >
            {user ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
