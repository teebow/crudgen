import { createContext } from "react";
import type { UserDto } from "@dto/user/dto/user.dto";
import type { PostDto } from "@dto/post/dto/post.dto";
import type { useApi } from "../api/use-api";

interface DataContextType {
  users: ReturnType<typeof useApi<UserDto>>;
  posts: ReturnType<typeof useApi<PostDto>>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);
