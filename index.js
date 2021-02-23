const axios = require('axios');
const cheerio = require('cheerio');
const open = require('open');
const log = console.log;

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
                        // 500 에러는 일시적인 접속 불가로 판단하여 재시도
                        // 무한 루프의 위험성이 존재한다
                        downloadPackage($);
                    }
                });
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
              const href = $(element).find('a').attr('href');
              if (!downloadedPackage.includes(href)) {
                  downloadedPackage.push(href);
                  getPackage(href)
              }
          });
        })
        .catch(reason => {
            if (reason.response.status === 500) {
                // 500 에러는 일시적인 접속 불가로 판단하여 재시도
                // 무한 루프의 위험성이 존재한다
                getPackage(url);
            }
        })
};

const myArgs = process.argv.slice(2);

if (myArgs[0]) {
    getPackage(myArgs[0]);
} else {
    console.error('Input commandLine Ubuntu package URL like /groovy/libc6')
}