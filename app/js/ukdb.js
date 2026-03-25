// Universal Harmonix — UK Sighting Database filter + pagination
// Pure functions — no DOM, no I/O.

export function filterRecords(records, { shape, hynek, yearFrom, yearTo, source } = {}) {
  return records.filter(r => {
    if (source && source !== 'all') {
      if ((r.source || 'NUFORC') !== source) return false;
    }
    if (shape && shape !== 'all') {
      if (!r.tags?.shape?.includes(shape)) return false;
    }
    if (hynek && hynek !== 'all') {
      if (r.tags?.hynek !== hynek) return false;
    }
    if (yearFrom || yearTo) {
      const year = r.datetime ? new Date(r.datetime).getFullYear() : null;
      if (year === null) return false;
      if (yearFrom && year < yearFrom) return false;
      if (yearTo   && year > yearTo)   return false;
    }
    return true;
  });
}

export function paginateRecords(records, page, pageSize) {
  const totalCount = records.length;
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (currentPage - 1) * pageSize;
  const items = records.slice(start, start + pageSize);
  return { items, totalCount, totalPages, currentPage };
}
