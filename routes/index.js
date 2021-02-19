const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const open = require('open');
const log = console.log;

const router = express.Router();


const downloadedPackage= [];

const getHtml = (url) => {
  try {
    return axios.get('https://packages.ubuntu.com' + url);
  } catch (e) {
      console.error(e);
  }
};

const downloadPackage = ($) => {
    const $download = $('div#pdownload th a');
    $download.each((index, element) => {
        const architecture = $(element).text();
        if (architecture === 'all' || architecture === 'amd64') {
            getHtml($download.attr('href'))
                .then(html => {
                  const $ = cheerio.load(html.data);
                  const url = $('div.cardleft li a').attr('href');
                    log(url)
                    if (url !== undefined) {
                        open(url);
                    }
                })
                .catch(reason => {
                    if (reason.response.status === 500) {
                        downloadPackage($);
                    }
                })
            return false;
        }
    });
};

const getPackage = (url) => {
    getHtml(url)
        .then(html => {
          const $ = cheerio.load(html.data);
          downloadPackage($);
          const $dependsList = $('div#pdeps').children('ul.uldep').children('li');
          $dependsList.each(function (index, element) {
              if ($(element).find('a').text().startsWith('libc6')) {

              } else {
                  const href = $(element).find('a').attr('href');
                  if (!downloadedPackage.includes(href)) {
                      downloadedPackage.push(href)
                      getPackage(href)
                  }
              }
          });
        })
        .catch(reason => {
            if (reason.response.status === 500) {
                getPackage(url);
            }
        })
};

getPackage('/groovy/alien');

module.exports = router;
