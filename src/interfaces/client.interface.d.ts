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

export interface IClientAttributes {
  id: number;
  id_user: number | null;
  dni: string | null;
  name: string | null;
  phone: string | null;
  // address: string | null; // Campo comentado - verificar si existe en DB
  // email: string | null; // Campo comentado - verificar si existe en DB
  // city: string | null; // Campo comentado - verificar si existe en DB
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ICompanyAttributes {
  id: number;
  id_user: number | null;
  dni: string | null;
  name: string | null;
  phone: string | null;
  // address: string | null; // Campo comentado - verificar si existe en DB
  // email: string | null; // Campo comentado - verificar si existe en DB
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface IPersonDTO {
  id_user: number | null;
  dni: string | null;
  name: string | null;
  phone: string | null;
  company_ids?: number[];
}
