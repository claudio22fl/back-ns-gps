export interface IUser extends TSharedCUD {
  id: number;
  id_type_user: number;
  name: string;
  email: string;
  username: string;
  password: string;
}
