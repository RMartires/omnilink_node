const axios = require("axios");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const filestack = require("filestack-js");
const FormData = require("FormData");
const fs = require("fs");
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
  const client = filestack.init("Am8sL0VMyTgKfJzyPEBioz");
  const token = {};

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  var isimg = false;
  var img;

  var page = await browser.newPage();
  await page.goto(`https://www.instadp.com/fullsize/${username}`, [
    { waitUntil: "networkidle0" },
  ]);

  await page.on("load", () => {});
  //await page.focus(".download-btn");
  //await page.click(".download-btn");
  await page.screenshot({ path: `public/images/IM_${username}.png` });

  img = `https://omnilink.herokuapp.com/images/IM_${username}.png`;

  //
  //
  page.close();
  console.log(username + " " + img);

  return img;
}
