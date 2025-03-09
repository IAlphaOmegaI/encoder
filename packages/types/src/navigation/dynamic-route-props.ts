export type DynamicSlugProps<T extends string = "id"> = {
  params: Promise<Record<T, string>>;
};
