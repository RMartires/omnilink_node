const axios = require("axios");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();

var Airtable = require("airtable");
var base = new Airtable({ apiKey: process.env.ATapikey }).base(
  process.env.ATbasekey
);

exports.loginget = (req, res, next) => {
  var username = req.params.username;
  var token;

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
          token = jwt.sign(
            {
              username: records[0].get("username"),
              profile_picture: records[0].get("profile_picture")[0].url,
              recordid: records[0].id,
            },
            "heyphil123"
          );
          //else
        } else {
          token = "NAN";
        }
        res.json({
          token: token,
        });
        //end
      },
      (err) => {
        if (err) {
          return;
        }
      }
    );
};

exports.loginpost = (req, res, next) => {
  var username = req.params.username;
  var email = req.body.email;
  var userID = req.body.userID;

  getprofilepicture(username).then((img) => {
    // console.log(img + " " + username);
    base("users").create(
      [
        {
          fields: {
            username: username,
            profile_picture: [{ url: img }],
            links: [],
            Email: email,
            userID: userID,
            firsttime: 1,
            theme: "13",
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
              profile_picture: records[0].get("profile_picture")[0].url,
              recordid: records[0].id,
              firsttime: true,
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
};

async function getprofilepicture(username) {
  const puppeteer = require("puppeteer");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  var isimg = false;
  var img;

  while (!isimg) {
    var page = await browser.newPage();
    await page.goto(`https://www.instadp.com/fullsize/${username}`, [
      { waitUntil: "networkidle0" },
    ]);
    img = await page.$eval(".picture", (el) => el.src);

    if (img.split("//")[1]) {
      if (img.split("//")[1].split("-")[0]) {
        isimg = true;
      }
    }

    console.log(username + "  " + img);
    page.close();
  }

  return img;
}
