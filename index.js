const express = require('express');
const neo4j = require('neo4j-driver').v1;
const cuid = require('cuid');
const colors = require('colors');

require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const session = driver.session();

const foodGroups = require('./food-groups');
const service = require('./src/service');

const command = process.argv[2];

if (command === 'gather') {
  gatherEntries().then(entries => {
    console.log(`total number of entries: `.cyan + `${entries.length}`.underline.bold.white);
    console.log('---------------------------------');
  });
}

if (command === 'collect') {
  gatherEntries().then(entries => {
    console.log(`total number of entries: `.cyan + `${entries.length}`.underline.bold.white);
    console.log('---------------------------------');
    collectNutritionalData(entries)
  });
  //collectNutritionalData();
}

if (command === 'fg') {
  mergeFoodGroups();
}

function collectNutritionalData(entries) {
  console.log('initializing complete collection of reports...'.blue);
  let i = 0;
  const interval = setInterval(() => {
    const entry = entries[i];
    console.log('persisting item '.blue + `${i+1}/${entries.length}`.underline.white + ` "${entries[i].name}"`.yellow);
    console.log('fetching report...'.blue);
    service.getReport(entries[i].ndbno).then(({ report }) => {
      const params = {
        json: JSON.stringify(report)
      };
      session.run(`
        MATCH (fg:FoodGroup {name: "${entry.group}"})
        WITH fg
        MERGE (i:Ingredient {name: "${entry.name}"})
        ON CREATE SET i.id = "${cuid()}"
        WITH fg, i
        MERGE (r:Report {usdaId:"${report.food.ndbno}"})
        ON CREATE SET r.id = "${cuid()}"  
        SET r.data = {json}
        WITH fg, i , r
        MERGE (i)-[:IS_GROUP]->(fg)
        WITH fg, i , r
        MERGE (i)-[:HAS_NUTRIENTS]->(r)
        RETURN r
      `, params)
          .then(() => console.log('report successfully persisted'.green))
          .catch(console.error);
    })
    if (i == entries.length - 1) {
      clearInterval(interval);
    }
    i++;
  }, 3700);
}

function mergeFoodGroups() {
  foodGroups.forEach(fg => {
    session.run(`
      MERGE (fg:FoodGroup {name: "${fg.name}", usdaId: "${fg.id}"})
      ON CREATE SET fg.id = "${cuid()}"        
    `)
      .then(() => console.log(`food group ${fg.name} successfully persisted`))
      .catch(console.error);
  });
}

function gatherEntries() {
  console.log('Fetching all search entries...'.blue);
  const promises = foodGroups.map(service.searchGroup);

  return Promise.all(promises).then(values => {
    return values.reduce((sum, val) => {
      console.log(`${val.list.item[0].group}: `.yellow + `${val.list.total}`.white);
      return [...sum, ...val.list.item];
    }, []);
  });
}



