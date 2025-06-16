import { useState } from "react";
import UserForm from "./Form";
import type { UserDto } from "@dto/user/dto/user.dto";
import { useApi } from "@core/api/use-api";

export default function UserPage() {
  const { useCreate, useUpdate } = useApi<UserDto>("user");
  const { mutateAsync: create } = useCreate();
  const { mutateAsync: update } = useUpdate();
  // Simulate a fetched user (e.g., from backend)
  const [existingUser, setExistingUser] = useState<UserDto | null>({
    id: 1,
    name: "Jane Doe",
    email: "jane@example.com",
  });

  const [message, setMessage] = useState("");

  const createUser = async (userData: Omit<UserDto, "id">) => {
    await create(userData);
    setMessage(`✅ User "${userData.name}" created`);
  };

  const updateUser = async (userData: UserDto) => {
    //await update(userData.id.toString(), userData);
    setMessage(`✏️ User "${userData.name}" updated`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {existingUser ? "Update User" : "Create User"}
      </h1>

      <UserForm
        user={existingUser}
        onSubmit={(user: UserDto) => {
          if (existingUser?.id) {
            updateUser({ ...user, id: existingUser.id });
          } else {
            createUser(user);
          }
        }}
      />

      {message && (
        <div className="mt-4 text-green-600 font-medium">{message}</div>
      )}
    </div>
  );
}
