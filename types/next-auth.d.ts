import { UserModel } from "@/types/models";

declare module "next-auth" {
  interface Session {
    user: UserModel;
  }
  interface User extends UserModel {}
}
