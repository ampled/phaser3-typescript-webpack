/** Compile wav audio files to mp3 and ogg sprite sheets  */

var audiosprite = require('audiosprite');
var fs = require('fs');
var winston = require('winston');

var files = [
  'src/assets/@raw/sounds/wav/death.wav',
  'src/assets/@raw/sounds/wav/enemykill.wav',
  'src/assets/@raw/sounds/wav/enemyshot.wav',
  'src/assets/@raw/sounds/wav/enemyloop.wav',
  'src/assets/@raw/sounds/wav/foley.wav',
  'src/assets/@raw/sounds/wav/jump.wav',
  'src/assets/@raw/sounds/wav/shoot.wav',
  'src/assets/@raw/sounds/wav/starget.wav',
  'src/assets/@raw/sounds/wav/pause.wav',
];

var opts = { output: 'src/assets/sounds/sfx', log: 'info', export: 'mp3,ogg', path: '.' };

audiosprite(files, opts, function (err, obj) {
  if (err) return console.error(err);
  console.log(JSON.stringify(obj, null, 2));
  var jsonfile = opts.output + '.json';
  fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
  winston.info('Exported json OK', { file: jsonfile });
});

audiosprite(
  ['src/assets/@raw/music/bgm1.wav'],
  { output: 'src/assets/music/bgm1', export: 'mp3,ogg', path: '.', loop: ['bgm1'] },
  function (err, obj) {
    if (err) return console.error(err);
    console.log(JSON.stringify(obj, null, 2));
  });