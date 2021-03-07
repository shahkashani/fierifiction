require('dotenv').config();

const FieriFiction = require('./');

const argv = require('yargs')
  .boolean('nomusic')
  .usage('Usage: $0 <command> [options]').argv;

const {
  GOOGLE_CLOUD_CREDENTIALS_BASE64,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = process.env;
const { mp3, gif, loop, text, output, nomusic } = argv;

const ff = new FieriFiction({
  googleCloudCredentials: Buffer.from(
    GOOGLE_CLOUD_CREDENTIALS_BASE64,
    'base64'
  ).toString(),
  spotifyClientId: SPOTIFY_CLIENT_ID,
  spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
});

(async function () {
  if (text && mp3) {
    await ff.textToSpeech(text, mp3);
  }
  if (gif && mp3 && output) {
    await ff.createVideo(gif, mp3, output);
    if (!nomusic) {
      ff.addSoundtrack(gif, output, text, loop);
    }
  }
})();
