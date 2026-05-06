import * as R from 'ramda';

export const formatPrice = (price) => {
  if (price == null || price === '' || Number(price) === 0) return 'Ücretsiz';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
};

export const formatDateLong = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const imgUrl = (path) => {
  if (!path) return null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}/${path}`;
};

export const filterByType = (type) =>
  R.isNil(type) || type === 'all'
    ? R.identity
    : R.filter(R.propEq(type, 'type'));

export const filterBySearch = (term) => {
  if (!term) return R.identity;
  const needle = String(term).trim().toLowerCase();
  if (!needle) return R.identity;
  const matches = (value) =>
    typeof value === 'string' && value.toLowerCase().includes(needle);
  return R.filter(
    (item) => matches(item?.title) || matches(item?.description),
  );
};

export const sortByPrice = (direction = 'asc') => {
  const cmp =
    direction === 'desc'
      ? R.descend(R.propOr(0, 'price'))
      : R.ascend(R.propOr(0, 'price'));
  return R.sort(cmp);
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const filterUpcomingEvents = (events) => {
  const now = startOfDay(new Date());
  return events.filter((e) => e.event_date && new Date(e.event_date) >= now);
};

export const filterThisWeekEvents = (events) => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = startOfDay(new Date(now));
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return events.filter((e) => {
    const d = new Date(e.event_date);
    return d >= monday && d < sunday;
  });
};

export const filterThisMonthEvents = (events) => {
  const now = new Date();
  return events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
};

export const sortByDate = (events) =>
  [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

export const applyListingFilters = ({
  type,
  search,
  sort = 'asc',
} = {}) =>
  R.pipe(
    filterByType(type),
    filterBySearch(search),
    sortByPrice(sort),
  );
