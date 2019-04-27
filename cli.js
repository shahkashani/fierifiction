require('dotenv').config();

const FieriFiction = require('./');

const argv = require('yargs').usage('Usage: $0 <command> [options]').argv;

const { GCLOUD_ACCESS_TOKEN } = process.env;
const { mp3, gif, loop, text, output } = argv;

const ff = new FieriFiction({
  gcloudAccessToken: GCLOUD_ACCESS_TOKEN
});

(async function() {
  if (text && mp3) {
    await ff.textToSpeech(text, mp3);
  }
  if (gif && mp3 && output) {
    await ff.createVideo(gif, mp3, output);
    ff.addSoundtrack(gif, output, loop);
  }
})();
