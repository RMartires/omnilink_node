const fs = require("fs");
const path = require("path");

exports.sendimage = (req, res, next) => {
  var name = req.params.name;
  res.sendFile(path.join(__dirname + `../public/images/IM_${name}.png`));
};
