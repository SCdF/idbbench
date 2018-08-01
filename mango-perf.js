const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

const DB = PouchDB(`http://admin:pass@localhost:5984/a_mango_test_${new Date().getTime()}`);

const docsByType = function(doc) {
  emit(doc.type);
};

const ddoc = {
  _id: '_design/normal-views',
  views: {
    docsByType: {
      map: `${docsByType}`
    }
  }
}

const docsByTypeIndex = {
    index: {
        fields: ['type']
    },
    name: 'type-index',
    type: 'json'
}

const ROUNDS = 1000;
const BATCH = 100;

const oneOf = things => things[Math.floor(Math.random() * things.length)];

const doc = () => ({
  type: oneOf(['foo', 'bar', 'smang'])
});

Promise.resolve()
  .then(() => DB.put(ddoc))
  .then(() => DB.createIndex(docsByTypeIndex))
  .then(() => {
    let p = Promise.resolve();

    [...Array(ROUNDS)].forEach(() => {
      const docs = [...Array(BATCH)].map(doc);
      p = p.then(() => DB.bulkDocs(docs));
    });

    return p;
  })
  .then(() => {
    console.log('DONE');
  })
  .catch(console.error)
