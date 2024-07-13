import { QueryParams } from '../types/QueryParams';

export function getQueryParams(
  query: QueryParams,
  defaultSortBy?: string,
  defaultSortDirection?: string,
) {
  const pageNumber = query?.pageNumber ? Number(query.pageNumber) : 1;
  const pageSize = query?.pageSize ? Number(query.pageSize) : 10;
  const sortBy = query?.sortBy ?? (defaultSortBy || 'id');
  const sortDirection: 'DESC' | 'ASC' =
    (query?.sortDirection?.toUpperCase() as 'DESC' | 'ASC') ??
    (defaultSortDirection || 'ASC');
  const skip = (pageNumber - 1) * pageSize;

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    skip,
  };
}
