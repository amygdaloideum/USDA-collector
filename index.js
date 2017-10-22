const express = require('express');
const fetch = require('node-fetch');
const querystring = require('querystring');
require('dotenv').config();

const foodGroups = require('./food-groups');
const SEARCH_URL = 'https://api.nal.usda.gov/ndb/search/'

const app = express()


app.get('/total', function (req, res) {
  const promises = foodGroups.map(fg => {
    const queryParams = querystring.stringify({
      format: 'json',
      sort: 'n',
      max: 10,
      offset: 0,
      fg: fg.id,
      api_key: process.env.API_KEY,
    });
    return fetch(`${SEARCH_URL}?${queryParams}`).then(r => r.json());
  });

  Promise.all(promises).then(values => {
    let total = 0;
    values.forEach(v => {
      total += v.list.total;
      console.log(v.list.item[0].group + ': ' + v.list.total)
    });
    console.log('Total: ' + total);
  });
  res.send('Hello World!')
})

app.listen(4444, function () {
  console.log('Example app listening on port 4444!')
})