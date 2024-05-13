const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
module.exports.convertToCurrentDateTimeString = (dateTime) => {
  return dayjs(dateTime).tz("Asia/Manila").toISOString();
};
