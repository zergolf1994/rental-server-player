const parser = require("ua-parser-js");

exports.get_ua = (useragent = undefined) => {
  try {
    if(!useragent) throw new Error("useragent not found")
    return parser(useragent);
  } catch (error) {
    return {};
  }
};
