export type CatalogueOptions = {
  q?: string; mode?: string; status?: string; country?: string;
  tags?: string[]; sort?: string; page?: number;
};
export function catalogueUrl(options: CatalogueOptions) {
  const query = new URLSearchParams();
  for (const key of ["q", "mode", "status", "country"] as const) {
    if (options[key]) query.set(key, options[key]);
  }
  if (options.sort === "title") query.set("sort", "title");
  for (const tag of options.tags ?? []) query.append("tag", tag);
  if ((options.page ?? 1) > 1) query.set("page", String(options.page));
  return `/hackathons${query.size ? `?${query}` : ""}`;
}
