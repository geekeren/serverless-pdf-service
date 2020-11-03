'use strict';

const chromium = require('chrome-aws-lambda');
const { get } = require('lodash');

exports.handler = async (event, context, callback) => {
  let result = null;
  let browser = null;

  try {
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
    },
  });
};