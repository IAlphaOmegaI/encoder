export type SystemFields = {
  id: string;
  created_at: number;
  updated_at: number;
};

export type OmitSystemFields<T> = Omit<T, keyof SystemFields>;