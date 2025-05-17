export interface IPerson {
  id: number;
  id_user: number | null;
  dni: string | null;
  name: string | null;
  phone: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  companies?: IPerson[];
}

export interface IPersonDTO {
  id_user: number | null;
  dni: string | null;
  name: string | null;
  phone: string | null;
  company_ids?: number[];
}
