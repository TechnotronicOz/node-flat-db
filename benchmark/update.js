var fs = require('fs');
var stats = {};
var start = 0;
var microtime = require('microtime');
var filesize = require('filesize');
var flat = require('../src/index');
var storage = require('../src/file-sync');
var db = flat('./benchmark/db.json', { storage: storage });

for(var i = 0; i < 1000; i++) {
    start = microtime.now();
    db('posts')
      .chain()
      .find({ id: i })
      .assign({ title: 'node-flat-db is awesome!++'});
    stats[i] = {
        time: microtime.now() - start,
        size: filesize(fs.statSync('./benchmark/db.json')['size'])
    };
}

fs.writeFileSync('./benchmark/stats/update.json', JSON.stringify(stats, null, 4));

stats = {};
storage = require('../src/file-compress-sync');
db = flat('./benchmark/db-compressed.json', { storage: storage });

for(var j = 0; j < 1000; j++) {
    start = microtime.now();
    db('posts')
      .chain()
      .find({ id: j })
      .assign({ title: 'node-flat-db is awesome!++'});
    stats[i] = {
        time: microtime.now() - start,
        size: filesize(fs.statSync('./benchmark/db-compressed.json')['size'])
    };
}

fs.writeFileSync('./benchmark/stats/update-compressed.json', JSON.stringify(stats, null, 4));
