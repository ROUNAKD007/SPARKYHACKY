export const getTodayDateKeyUtc = () => {
  return new Date().toISOString().slice(0, 10);
};

export const getDateKeyUtc = (value) => {
  return new Date(value).toISOString().slice(0, 10);
};

export const getYesterdayDateKeyUtc = () => {
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  return yesterday.toISOString().slice(0, 10);
};
