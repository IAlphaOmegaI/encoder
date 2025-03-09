import { v4 as uuid } from "uuid";

export type FormattedFile = File & {
  id: string;
  preview: string;
};

export const formatFile = (file: File): FormattedFile => {
  return Object.assign(file, {
    id: uuid(), // crypto.randomUUID() => only supported on https
    preview: URL.createObjectURL(file),
  });
};
