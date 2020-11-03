'use strict';

const chromium = require('chrome-aws-lambda');
const { get } = require('lodash');

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null;

  try {
    await chromium.font('https://www.wfonts.com/download/data/2014/06/01/microsoft-yahei/chinese.msyh.ttf');
    await chromium.font('https://ff.static.1001fonts.net/r/o/roboto.regular.ttf');
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();
    const url = get(event, 'queryStringParameters.url', 'https://www.google.com');
    await page.goto(url, { waitUntil: 'networkidle0' });
    result = await page.pdf();
  } catch (error) {
    return callback(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return callback(null, {
    statusCode: 200,
    body: result.toString('base64'),
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-disposition': 'inline; filename=\"demo.pdf\"',
    },
  });
};