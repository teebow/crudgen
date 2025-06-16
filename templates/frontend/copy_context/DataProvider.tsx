import { useApi } from "../api/use-api";
import type { UserDto } from "@dto/user/dto/user.dto";
import type { PostDto } from "@dto/post/dto/post.dto";
import { DataContext } from "./DataContext";
import type { PropsWithChildren } from "react";

export const DataProvider = ({ children }: PropsWithChildren) => {
  const users = useApi<UserDto>("user");
  const posts = useApi<PostDto>("post");

  return (
    <DataContext.Provider value={{ users, posts }}>
      {children}
    </DataContext.Provider>
  );
};
