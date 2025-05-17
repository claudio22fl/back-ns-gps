export interface TSharedCUD {
  create_at?: string;
  update_at?: string;
  delete_at?: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}
