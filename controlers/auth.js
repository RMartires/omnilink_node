const axios = require('axios');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');


var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'key6g32DRULc2ELR4' }).base('app0XNGZWSAZxUY6M');


exports.login = (req, res, next) => {
    var username = req.params.username;
    console.log(username);

    base('users').select({
        filterByFormula: `{username} = '${username}'`,
        view: "Grid view"
    }).eachPage((records, fetchNextPage) => {

        if (records.length === 1) {
            //console.log(records[0].get('username'));
            //console.log(records[0].get('profile_picture'));
            //console.log(records[0].get('linkslu'));
            const token = jwt.sign({
                username: records[0].get('username'),
                profile_picture: records[0].get('profile_picture'),
                recordid: records[0].id
            }, 'heyphil123');

            res.json(
                {
                    token: token
                }
            );

        } else {
            axios({
                url: `https://www.instadp.com/fullsize/${username}`,
                method: 'GET',
                mode: 'cors'
            })
                .then(html => {
                    var $ = cheerio.load(html.data);
                    var data = $('.picture').attr();
                    //console.log(data);

                    base('users').create([
                        {
                            "fields": {
                                "username": username,
                                "profile_picture": data.src,
                                "links": []
                            }
                        }
                    ], function (err, records) {
                        if (err) {
                            console.error(err);
                            return;
                        } else {
                            const token = jwt.sign({
                                username: username,
                                profile_picture: data.src,
                                recordid: records[0].id
                            }, 'heyphil123');

                            res.json(
                                {
                                    token: token
                                }
                            );
                        }
                    });

                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, (err) => {
        if (err) { console.error(err); return; }
    });


};

