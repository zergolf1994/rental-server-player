const parser = require("ua-parser-js");

exports.testUa = async (req, res) => {
  try {
    const user_agent = req?.headers["user-agent"];
    var ua = parser(req.headers['user-agent']);
    return res.json({ ...ua });
  } catch (err) {
    console.log(err)
    return res.json({ error: true, msg: err?.name });
  }
};
