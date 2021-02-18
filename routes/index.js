const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const log = console.log;

const router = express.Router();

const getHtml = async () => {
  try {
    return await axios.get('https://packages.ubuntu.com/groovy/alien');
  } catch (e) {
    console.error(e);
  }
};

getHtml()
    .then(html => {
      let depends = [];
      const $ = cheerio.load(html.data);
      const dependsList = $('div#pdeps').children('ul.uldep').children('li');

      dependsList.each(function (index, element) {
        depends.push($(element).find('a').text())
      })

      log(depends);
    })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
