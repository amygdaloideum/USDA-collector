const express = require('express');
const fetch = require('node-fetch');
const querystring = require('querystring');
const neo4j = require('neo4j-driver').v1;

require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();

const foodGroups = require('./food-groups');
const SEARCH_URL = 'https://api.nal.usda.gov/ndb/search/'


const command = process.argv[2];

if (command === 'gather') {
  gatherEntries().then(entries => {
    console.log('total number of entries: ' + entries.length)
  });
}

if (command === 'collect') {
  //gatherEntries().then(collectNutritionalData);
}

function collectNutritionalData() {
  
  function* testGen(arr) {
    let i = 0;
    while (i !== arr.length -1) {
      
    }
  }

}

function gatherEntries() {
  console.log('Fetching all search entries...');
  const promises = foodGroups.map(fg => {
    const queryParams = querystring.stringify({
      format: 'json',
      sort: 'n',
      max: 1000,
      offset: 0,
      fg: fg.id,
      api_key: process.env.API_KEY,
    });
    return fetch(`${SEARCH_URL}?${queryParams}`).then(r => r.json());
  });

  return Promise.all(promises).then(values => {
    return values.reduce((sum, val) => {
      console.log(val.list.item[0].group + ': ' + val.list.total);
      return [...sum, ...val.list.item];
    }, []);
    /*let total = 0;
    values.forEach(v => {
      total += v.list.total;
      console.log(v.list.item[0].group + ': ' + v.list.total)
    });
    console.log('Total: ' + total);*/
  });
}



