export interface TProduct extends TSharedCUD {
  id: number;
  name: string;
  description: string;
  price: number;
  price_cost: number;
  stock: number;
  state: string;
}

export interface ProductAttributes extends TSharedCUD {
  id: number;
  name: string;
  description: string;
  price: number;
  price_cost: number;
  stock: number;
  state: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export interface IGetProductsBody {
  page?: number;
  limit?: number;
  filterValue?: string;
}
