import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';

export const searchParamsParsers = {
  q: parseAsString.withDefault(''),
  category: parseAsString.withDefault(''),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sort: parseAsString.withDefault('newest'),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
