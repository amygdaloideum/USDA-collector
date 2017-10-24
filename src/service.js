const fetch = require('node-fetch');
const querystring = require('querystring');

const api_key = process.env.API_KEY;

const SEARCH_URL = 'https://api.nal.usda.gov/ndb/search/'
const REPORT_URL = 'https://api.nal.usda.gov/ndb/reports/';


function searchGroup(fg) {
  const queryParams = querystring.stringify({
    format: 'json',
    sort: 'n',
    max: 1000,
    offset: 0,
    fg: fg.id,
    api_key,
  });
  return fetch(`${SEARCH_URL}?${queryParams}`).then(r => r.json());
}

function getReport(id) {
  const queryParams = querystring.stringify({
    ndbno: id,
    type: 'f',
    format: 'json',
    api_key,
  });
  return fetch(`${REPORT_URL}?${queryParams}`).then(r => r.json());
}

module.exports = {
  searchGroup,
  getReport,
};