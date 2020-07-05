const axios = require("axios");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const filestack = require("filestack-js");
const FormData = require("FormData");
const fs = require("fs");
dotenv.config();
var img;

var Airtable = require("airtable");
const { resolve } = require("path");
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
  var img = req.body.img;

  //
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
        //getprofilepicture(username, records[0].id).then((res) => {});
        const token = jwt.sign(
          {
            username: username,
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
  ); //end base.create
};

async function getprofilepicture(username, id) {
  const puppeteer = require("puppeteer");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  var isimg = false;

  var page = await browser.newPage();
  await page.goto(`https://www.instadp.com/`, [{ waitUntil: "networkidle0" }]);

  //await page.on("load", () => {});
  page.exposeFunction("gotimage", (url) => {
    console.log(url);
    console.log("hey");
  });

  //
  await page.screenshot({
    path: `public/images/${username}1.png`,
    fullPage: true,
  });
  await page.evaluate((username) => {
    document.querySelectorAll(".search-btn")[0].click();
    document.querySelectorAll(".search-input")[0].value = username;
    document.querySelectorAll(".search-btn")[1].click();
  }, username);
  await page.screenshot({
    path: `public/images/${username}2.png`,
    fullPage: true,
  });
  // await page.focus(".download-btn");
  // await page.click(".download-btn");

  //
  //
  //page.close();
  page.on("requestfinished", async (request) => {
    var resjson;
    try {
      resjson = await request.response().json();
    } catch (err) {
      //console.log(err);
    }
    if (resjson) {
      if (resjson.users) {
        await page.screenshot({
          path: `public/images/${username}3.png`,
          fullPage: true,
        });
        img = resjson.users[0].user.profile_pic_url;
        page.close();
        console.log(username + "  " + img);
        //
        base("users").update(
          [
            {
              id: id,
              fields: {
                profile_picture: [
                  {
                    url: img,
                  },
                ],
              },
            },
          ],
          function (err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record) {
              console.log(record.get("userID"));
            });
          }
        );
        //
      }
    }
  });
}
