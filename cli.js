const FieriFiction = require('./');

const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .required('gif')
  .required('mp3')
  .required('output').argv;

const { mp3, gif, loop, output } = argv;

const ff = new FieriFiction();

(async function() {
  await ff.createVideo(gif, mp3, output);
  ff.addSoundtrack(output, loop);
})();
