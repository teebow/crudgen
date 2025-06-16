import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { Input, Textarea } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";

import type { UserDto } from "@dto/user/dto/user.dto";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useApi } from "@core/api/use-api";
import type { PostDto } from "@dto/post/dto/post.dto";

type UserFormProps = {
  onCancel?: () => void;
  onSubmit: (user: UserDto) => void;
  showCancel?: boolean;
  user: UserDto | null;
};

export default function UserForm({
  user,
  onCancel,
  onSubmit,
  showCancel,
}: UserFormProps) {
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

  const { useList } = useApi<PostDto>("post");
  const { data: posts } = useList();

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full justify-center items-center space-y-4"
      id="user-form"
    >
      <div className="flex flex-col  w-full">
        <Controller
          key="name"
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field: { onChange, value } }) => (
            <Input
              id="name"
              label="Name"
              type="text"
              placeholder=""
              isRequired={true}
              value={value || ""}
              onValueChange={onChange}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              className="mb-4"
            />
          )}
        />

        <Controller
          key="email"
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              id="email"
              label="Email"
              type="text"
              placeholder=""
              isRequired={false}
              value={value || ""}
              onValueChange={onChange}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              className="mb-4"
            />
          )}
        />
        <Controller
          key="posts"
          name="posts"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              className="max-w-xs"
              defaultItems={posts}
              label="Posts"
              placeholder="Search a post"
              selectedKey={value || null}
              onSelectionChange={onChange}
            >
              {(post) => (
                <AutocompleteItem key={post.id}>{post.title}</AutocompleteItem>
              )}
            </Autocomplete>
          )}
        />
        {/* <Controller
          key="posts"
          name="posts"
          control={control}
          rules={{ required: "Posts is required" }}
          render={({ field: { onChange, value } }) => (
            <Input
              id="posts"
              label="Posts"
              type="text"
              placeholder=""
              isRequired={true}
              value={value || ""}
              onValueChange={onChange}
              isInvalid={!!errors.posts}
              errorMessage={errors.posts?.message}
              className="mb-4"
            />
          )}
        /> */}

        <Controller
          key="createdAt"
          name="createdAt"
          control={control}
          rules={{ required: "CreatedAt is required" }}
          render={({ field: { onChange, value } }) => (
            <div className="mb-4">
              <DatePicker
                id="createdAt"
                label="CreatedAt"
                isRequired={true}
                value={value ? parseDate(value) : undefined}
                onChange={(date) => {
                  if (date) {
                    onChange(date.toString());
                  }
                }}
                isInvalid={!!errors.createdAt}
                errorMessage={errors.createdAt?.message}
              />
            </div>
          )}
        />

        <Controller
          key="updatedAt"
          name="updatedAt"
          control={control}
          rules={{ required: "UpdatedAt is required" }}
          render={({ field: { onChange, value } }) => (
            <div className="mb-4">
              <DatePicker
                id="updatedAt"
                label="UpdatedAt"
                isRequired={true}
                value={value ? parseDate(value) : undefined}
                onChange={(date) => {
                  if (date) {
                    onChange(date.toString());
                  }
                }}
                isInvalid={!!errors.updatedAt}
                errorMessage={errors.updatedAt?.message}
              />
            </div>
          )}
        />

        <Controller
          key="deletedAt"
          name="deletedAt"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="mb-4">
              <DatePicker
                id="deletedAt"
                label="DeletedAt"
                isRequired={false}
                value={value ? parseDate(value) : undefined}
                onChange={(date) => {
                  if (date) {
                    onChange(date.toString());
                  }
                }}
                isInvalid={!!errors.deletedAt}
                errorMessage={errors.deletedAt?.message}
              />
            </div>
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
            startContent={!isSubmitting && <Icon icon="lucide:check" />}
          >
            {user ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
