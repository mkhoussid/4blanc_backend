export type WithOmittable<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
