export type Paginated<T> = {
  items: T[];
  metadata: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number
  }
};

export type Pager = {
  page: number;
  limit: number;
};
