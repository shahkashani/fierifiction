require('dotenv').config();

const FieriFiction = require('./');
const BadWords = require('bad-words');

const argv = require('yargs')
  .boolean('nomusic')
  .usage('Usage: $0 <command> [options]').argv;

class ModerationWords {
  constructor(
    bannedWords = [],
    cleanWords = ['God', 'fuck', 'fucking', 'damn', 'hell']
  ) {
    this.badWords = new BadWords();
    this.badWords.addWords(...bannedWords);
    this.badWords.removeWords(...cleanWords);
  }

  async validate(text) {
    return !this.badWords.isProfane(text);
  }
}

module.exports = ModerationWords;

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  POST_TEXT_GENERATOR_URL,
  POST_TEXT_GENERATOR_API_KEY,
  MICROSOFT_AZURE_SPEECH_TOKEN,
  MICROSOFT_AZURE_SPEECH_REGION,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  TUMBLR_ACCESS_TOKEN_KEY,
  TUMBLR_ACCESS_TOKEN_SECRET,
  TUMBLR_BLOG_NAME,
} = process.env;
const {
  mp3,
  gif,
  loop,
  text,
  output,
  nomusic,
  story,
  searchSong,
  voice,
  rate,
  style,
  gender,
  pitch,
  contour,
  voices,
  language,
  post,
  mp4,
} = argv;

const ff = new FieriFiction({
  voiceName: voice,
  voiceStyle: style,
  voiceGender: gender,
  voicePitch: pitch,
  voiceRate: rate,
  voiceContour: contour,
  voiceLanguage: language,
  voices: voices ? parseInt(voices, 10) : 1,
  spotifyClientId: SPOTIFY_CLIENT_ID,
  spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
  textGeneratorUrl: POST_TEXT_GENERATOR_URL,
  textGeneratorApiKey: POST_TEXT_GENERATOR_API_KEY,
  microsoftAzureSpeechToken: MICROSOFT_AZURE_SPEECH_TOKEN,
  microsoftAzureSpeechRegion: MICROSOFT_AZURE_SPEECH_REGION,
  tumblrConsumerKey: TUMBLR_CONSUMER_KEY,
  tumblrConsumerSecret: TUMBLR_CONSUMER_SECRET,
  tumblrTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
  tumblrTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
  tumblrBlogName: TUMBLR_BLOG_NAME,
  moderation: new ModerationWords(),
});

(async function () {
  if (post && mp4 && text) {
    await ff.createVideoPost(text, mp4);
    return;
  }
  if (searchSong) {
    console.log(await ff.getSong(searchSong));
  }
  if (story) {
    console.log(await ff.generateStory(story));
  }
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
