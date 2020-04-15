const axios = require('axios');
const cheerio = require('cheerio');

exports.temp = (req, res, next) => {
    var username = req.params.code;
    console.log(username);

    axios({
        url: `https://www.instadp.com/fullsize/${username}`,
        method: 'GET',
        mode: 'cors'
    })
        .then(html => {
            var $ = cheerio.load(html.data);
            var data = $('.picture').attr();
            console.log(data);

            res.json(
                {
                    username: username,
                    profile_picture: data.src
                }
            );
        })
        .catch(err => {
            console.log(err);
        });

};

