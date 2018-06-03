/** Compile wav audio files to mp3 and ogg sprite sheets  */

var audiosprite = require('audiosprite');
var glob = require('glob');
var fs = require('fs');
var winston = require('winston');


glob('src/assets/@raw/sounds/wav/*.wav', function (er, files) {
  var opts = { output: 'src/assets/sounds/sfx', log: 'info', export: 'mp3,ogg', path: '.' };

  audiosprite(files, opts, function (err, obj) {
    if (err) return console.error(err);
    console.log(JSON.stringify(obj, null, 2));
    var jsonfile = opts.output + '.json';
    fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
    winston.info('Exported sfx json OK', { file: jsonfile });
  });

});

audiosprite(
  ['src/assets/@raw/music/bgm1.wav'],
  { output: 'src/assets/music/bgm1', export: 'mp3,ogg', path: '.', gap: 0, ignorerounding: 1 },
  function (err, obj) {
    if (err) return console.error(err);
    console.log(JSON.stringify(obj, null, 2));
    var jsonfile = 'src/assets/music/bgm.json';
    fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
    winston.info('Exported bgm json OK', { file: jsonfile });
  });