import { PaginationQuery, PaginationResult } from "../types/common.types";

export const buildPaginationQuery = (query: PaginationQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

export const buildPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// export const buildSearchFilter = (search?: string, fields: string[] = []) => {
//   if (!search || fields.length === 0) return {};

//   return {
//     OR: fields.map((field) => ({
//       [field]: {
//         contains: search,
//         mode: "insensitive",
//       },
//     })),
//   };
// };

export const buildSearchFilter = (
  search: string | undefined,
  fields: string[]
): any => {
  if (!search || search.trim() === "") {
    return {};
  }

  const searchTerm = search.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        // For MySQL: case insensitive by default, no need for mode
        // For PostgreSQL: uncomment below
        // mode: "insensitive",
      },
    })),
  };
};
