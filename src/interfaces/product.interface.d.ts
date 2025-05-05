export interface TProduct extends TSharedCUD {
  id: number;
  name: string;
  description: string;
  price: number;
  price_cost: number;
  stock: number;
  state: string;
}
