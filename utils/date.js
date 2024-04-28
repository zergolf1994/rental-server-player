const dayjs = require("dayjs");

exports.remaining = (date) => {
  const today = dayjs();
  const exp = dayjs(date);
  const remaining = exp.diff(today, "day");
  return remaining;
};
