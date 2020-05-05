const axios = require("axios");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");

var Airtable = require("airtable");
var base = new Airtable({ apiKey: "key6g32DRULc2ELR4" }).base(
  "app0XNGZWSAZxUY6M"
);

exports.login = (req, res, next) => {
  var username = req.params.username;
  console.log(username);

  base("users")
    .select({
      filterByFormula: `{username} = '${username}'`,
      view: "Grid view",
    })
    .eachPage(
      (records, fetchNextPage) => {
        if (records.length === 1) {
          //console.log(records[0].get('username'));
          //console.log(records[0].get('profile_picture'));
          //console.log(records[0].get('linkslu'));
          const token = jwt.sign(
            {
              username: records[0].get("username"),
              profile_picture: records[0].get("profile_picture"),
              recordid: records[0].id,
            },
            "heyphil123"
          );

          res.json({
            token: token,
          });
        } else {
          getprofilepicture(username).then((img) => {
            console.log(img + " " + username);
            base("users").create(
              [
                {
                  fields: {
                    username: username,
                    profile_picture: img,
                    links: [],
                  },
                },
              ],
              function (err, records) {
                if (err) {
                  console.error(err);
                  return;
                } else {
                  const token = jwt.sign(
                    {
                      username: username,
                      profile_picture: img,
                      recordid: records[0].id,
                    },
                    "heyphil123"
                  );

                  res.json({
                    token: token,
                  });
                }
              }
            );
          });
        }
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
};

async function getprofilepicture(username) {
  const puppeteer = require("puppeteer");

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://www.instadp.com/fullsize/${username}`, [
    { waitUntil: "networkidle0" },
  ]);
  const img = await page.$eval(".picture", (el) => el.src);

  //console.log(img);
  page.close();
  return img;
}
