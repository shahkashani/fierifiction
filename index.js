const tumblr = require('tumblr.js');
const {
  writeFileSync,
  readFileSync,
  unlinkSync,
  createReadStream,
  createWriteStream,
} = require('fs');
const { parse } = require('path');
const { exec } = require('shelljs');
const { glob } = require('glob');
const { sample, truncate, map, uniq, flatten, range } = require('lodash');
const deepai = require('deepai');
const speachSdk = require('microsoft-cognitiveservices-speech-sdk');
const https = require('https');
const SpotifyWebApi = require('spotify-web-api-node');

const ATTEMPS = 3;

function download(url, dest) {
  var file = createWriteStream(dest);
  return new Promise((resolve, reject) => {
    var responseSent = false; // flag to make sure that response is sent only once.
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            if (responseSent) return;
            responseSent = true;
            resolve();
          });
        });
      })
      .on('error', (err) => {
        if (responseSent) return;
        responseSent = true;
        reject(err);
      });
  });
}

class FieriFiction {
  constructor({
    tumblrConsumerKey = null,
    tumblrConsumerSecret = null,
    tumblrTokenKey = null,
    tumblrTokenSecret = null,
    tumblrBlogName = null,
    audioGeneratorUrl = null,
    spotifyClientId = null,
    spotifyClientSecret = null,
    moderation = null,
    music = '*.mp3',
    textLength = 250,
    songPrefix = '',
    songPostfix = 'instrumental',
    textGeneratorApiKey,
    microsoftAzureSpeechToken,
    microsoftAzureSpeechRegion,
    voiceName,
    voiceStyle,
    voiceGender,
    voiceContour,
    voicePitch,
    voiceRate,
    voiceLanguage = 'en-',
    voices = 1,
  } = {}) {
    /** @type {tumblr.Client} */
    this.client = tumblr.createClient({
      token: tumblrTokenKey,
      token_secret: tumblrTokenSecret,
      consumer_key: tumblrConsumerKey,
      consumer_secret: tumblrConsumerSecret,
    });
    this.songPrefix = songPrefix;
    this.songPostfix = songPostfix;
    this.moderation = moderation;
    this.blogName = tumblrBlogName;
    this.textGeneratorApiKey = textGeneratorApiKey;
    this.audioGeneratorUrl = audioGeneratorUrl;
    this.textLength = textLength;
    this.music = music;
    this.voiceName = voiceName;
    this.voiceStyle = voiceStyle;
    this.voiceGender = voiceGender;
    this.voiceRate = voiceRate;
    this.voicePitch = voicePitch;
    this.voiceContour = voiceContour;
    this.voiceLanguage = voiceLanguage;
    this.voices = voices;

    this.loops = glob.sync(`${__dirname}/loops/${this.music}`);
    if (spotifyClientId && spotifyClientSecret) {
      this.spotify = new SpotifyWebApi({
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret,
      });
    }
    if (this.textGeneratorApiKey) {
      deepai.setApiKey(this.textGeneratorApiKey);
    }
    this.speechConfig = speachSdk.SpeechConfig.fromSubscription(
      microsoftAzureSpeechToken,
      microsoftAzureSpeechRegion
    );
  }

  replacements(captions) {
    return captions.replace(/♪/g, 'La la la');
  }

  captionsToString(captions) {
    if (typeof captions === 'string') {
      return captions;
    }
    return captions
      .join(' ')
      .replace(/\n/gi, ' ')
      .replace(/\s{2,}/, ' ');
  }

  getFullSentences(string, text) {
    const remaining = string.slice(text.length);
    const match = remaining.match(/[.!?]/gi);
    if (!match || match.length === 0) {
      return string;
    }
    const lastIndex = remaining.lastIndexOf(match[match.length - 1]);
    return `${text}${remaining.slice(0, lastIndex + 1)}`;
  }

  execCmd(cmd) {
    const result = exec(cmd, { silent: true });
    if (result.code !== 0) {
      console.error(`🐞 Oops: ${result.stderr}\n> ${cmd}`);
    }
    return result;
  }

  getVideoLength(file) {
    const output = this.execCmd(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    return output.trim();
  }

  isGif(file) {
    return file.endsWith('.gif');
  }

  getQuery(story, words = 3) {
    if (!story) {
      return null;
    }
    return story
      .replace(/[^A-z ]/g, '')
      .trim()
      .replace(/[\s]{2,}/g, ' ')
      .split(' ')
      .slice(0, words)
      .join(' ');
  }

  async addSoundtrack(image, video, story, loop = null) {
    const useLoop = loop || (await this.getSong(story));
    const trim = this.isGif(image) ? 3 : 1;
    console.log(`\n🎷 Adding music: ${useLoop}`);
    const len = Math.floor(this.getVideoLength(video) - trim);
    const cmd = `ffmpeg -i "${video}" -filter_complex "amovie='${useLoop}':loop=999,loudnorm[s];[0][s]amix=duration=shortest" -t ${len} -y "${video}-temp.mp4" && rm "${video}" && mv "${video}-temp.mp4" "${video}"`;
    this.execCmd(cmd);
    if (useLoop.indexOf('temp-') === 0) {
      unlinkSync(useLoop);
    }
  }

  createVideo(image, audio, output) {
    console.log('\n📽️  Generating video');

    const loop = this.isGif(image) ? '-ignore_loop 0' : '-loop 1';

    return this.execCmd(
      `ffmpeg -i "${audio}" ${loop} -i "${image}" -vf "scale='min(720,iw)':-2" -shortest -strict -2 -c:v libx264 -threads 4 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y -af extrastereo,lowpass=3000,highpass=200,alimiter "${output}"`
    );
  }

  getImage(images) {
    if (images.length === 1) {
      return images[0];
    }
    const firstImage = images[0];
    const escapedFilenames = images.map((image) => `"${image}"`);

    if (this.isGif(firstImage)) {
      const combinedFileName = `${firstImage}-combined.gif`;
      this.execCmd(
        `convert ${escapedFilenames.join(' ')} "${combinedFileName}"`
      );
      return combinedFileName;
    }

    const combinedFileName = `${firstImage}-combined.png`;
    this.execCmd(
      `convert ${escapedFilenames.join(' ')} -append "${combinedFileName}"`
    );
    return combinedFileName;
  }

  async getVoices() {
    if (this.voiceList) {
      return this.voiceList;
    }
    const synthesizer = new speachSdk.SpeechSynthesizer(this.speechConfig);
    const { voices } = await synthesizer.getVoicesAsync();
    this.voiceList = voices.filter((voice) =>
      voice.locale.startsWith(this.voiceLanguage)
    );

    const styles = uniq(flatten(map(this.voiceList, 'styleList')));
    console.log(`\n👨‍🎤 Available styles: `, styles);

    return this.voiceList;
  }

  async getVoice({ style, name, gender }) {
    const voices = await this.getVoices();
    let returnStyle = style;

    const genderMap = { female: 1, male: 2 };
    let useVoices = voices;

    if (name) {
      useVoices = voices.filter(
        (voice) => voice.shortName === name || voice.localName === name
      );
      if (useVoices.length === 0) {
        console.error(`⚠️  Could not find voice ${name}`);
        useVoices = voices;
      }
    }

    if (style) {
      const preStyleFilter = useVoices;
      useVoices = useVoices.filter(
        (voice) => voice.styleList.indexOf(style) !== -1
      );
      console.log(
        `☕️ Filtered down to ${useVoices.length} voices based on style ${style}.`
      );
      if (useVoices.length === 0) {
        console.error(
          '⚠️  Filtered down to zero voices. Removing style filter.'
        );
        useVoices = preStyleFilter;
      }
    }

    if (gender) {
      if (!genderMap[gender]) {
        console.error(`⚠️ Gender ${gender} not supported.`);
      } else {
        const preGenderFilter = useVoices;
        useVoices = useVoices.filter(
          (voice) => voice.gender === genderMap[gender]
        );
        console.log(
          `☕️ Filtered down to ${useVoices.length} voices based on gender ${gender}.`
        );
        if (useVoices.length === 0) {
          console.error(
            '⚠️  Filtered down to zero voices. Removing gender filter.'
          );
          useVoices = preGenderFilter;
        }
      }
    }

    if (useVoices.length === 0) {
      console.error(
        '⚠️  Filtered down to zero voices. Using the full set instead.'
      );
      useVoices = voices;
    }

    console.log(`\n🧑‍🎤 Picking one of these`, map(useVoices, 'shortName'));
    const returnVoice = sample(useVoices);

    if (
      !returnStyle &&
      returnVoice.styleList &&
      returnVoice.styleList.length > 0
    ) {
      console.log(
        `\n👨‍🎤 Voice ${returnVoice.shortName} has styles`,
        returnVoice.styleList
      );
      returnStyle = sample(returnVoice.styleList);
    }

    return {
      voice: returnVoice.shortName,
      style: returnStyle,
    };
  }

  async textToSpeech(text, output) {
    if (this.voices < 2) {
      return this.createTextToSpeech(text, output);
    }

    const { dir, name } = parse(output);
    const files = range(1, this.voices + 1).map(
      (i) => `${dir ? `${dir}/` : ''}${i} - ${name}`
    );

    for (let file of files) {
      await this.createTextToSpeech(text, file);
    }

    const is = files.map((file) => `-i "${file}"`);
    const as = files.map((_file, i) => `[${i}:a]`);
    const cmd = `ffmpeg ${is.join(' ')} -filter_complex "${as.join(
      ''
    )}amix=inputs=${this.voices}[a]" -map "[a]" -ac 2 -y "${output}"`;

    this.execCmd(cmd);

    for (let file of files) {
      unlinkSync(file);
    }
  }

  async createTextToSpeech(text, output) {
    console.log('\n🕋 Synthesizing');
    const input = this.replacements(text);
    const { voice, style } = await this.getVoice({
      name: this.voiceName,
      style: this.voiceStyle,
      gender: this.voiceGender,
    });
    console.log(`\n🎙️  Voice: ${voice}${style ? `, style: ${style}` : ''}`);
    const synthesizer = new speachSdk.SpeechSynthesizer(this.speechConfig);
    const textString = speachSdk.SpeechSynthesizer.XMLEncode(input);
    const sRate = this.voiceRate ? ` rate="${this.voiceRate}"` : '';
    const sPitch = this.voicePitch ? ` pitch="${this.voicePitch}"` : '';
    const sContour = this.voiceContour ? ` contour="${this.voiceContour}"` : '';
    const sStyle = style ? ` style="${style}"` : '';
    let prosodyStart = '';
    let prosodyEnd = '';

    if (sRate || sPitch || sContour) {
      prosodyStart = `<prosody${sRate}${cPitch}${cContour}>`;
      prosodyEnd = '</prosody>';
    }

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${voice}">
    <mstts:express-as${sStyle}>${prosodyStart}${textString}${prosodyEnd}</mstts:express-as>
  </voice>
</speak>`;

    console.log(`\n${ssml}`);

    await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          const writeStream = createWriteStream(output);
          writeStream.write(Buffer.from(result.audioData), 'binary');
          writeStream.on('finish', () => {
            resolve(output);
          });
          writeStream.end();
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    return output;
  }

  async generateStoryRaw(captions) {
    console.log(`\n💭 Talking to AI`);
    const text = this.captionsToString(captions);
    const req = await deepai.callStandardApi('text-generator', {
      text,
    });
    if (!req || !req.output) {
      return null;
    }
    console.log('\n== Raw output ==\n');
    console.log(req.output);
    console.log('\n== Raw output ==\n\n');
    const result = truncate(req.output, {
      length: this.textLength + text.length,
      separator: /,?\.* +/,
      omission: '',
    });
    return this.getFullSentences(result, text)
      .replace(/["“”]/g, '')
      .replace(/[\n\r]{2,}/g, '\n\n');
  }

  async generateStory(captions) {
    const text = this.captionsToString(captions);
    if (!this.moderation) {
      return await this.generateStoryRaw(captions);
    }
    for (let i = 0; i < ATTEMPS; i += 1) {
      const story = await this.generateStoryRaw(captions);
      const addedStory = story.slice(text.length);
      if (await this.moderation.validate(addedStory)) {
        return story;
      } else {
        console.error('Does not pass validation: ', story);
      }
    }
    return `${text}...wow.`;
  }

  async getSong(story) {
    const random = sample(this.loops);

    if (!this.spotify || !story) {
      console.log(`🎷 Grabbing a random track...`);
      return random;
    }

    const tokenResult = await this.spotify.clientCredentialsGrant();
    this.spotify.setAccessToken(tokenResult.body.access_token);

    const filename = `temp-${this.getQuery(story)
      .toLowerCase()
      .replace(/ /g, '-')}.mp3`;

    let attempts = [];

    for (let i = 4; i > 0; i -= 1) {
      attempts.push(
        `${this.songPrefix} ${this.getQuery(story, i)} ${
          this.songPostfix
        }`.trim()
      );
    }

    for (let j = 4; j > 0; j -= 1) {
      attempts.push(`${this.getQuery(story, j)}`);
    }

    try {
      let items = [];
      while (attempts.length > 0 && items.length === 0) {
        let query = attempts.shift();
        console.log(`🎷 Searching for "${query}"...`);
        const result = await this.spotify.searchTracks(
          `${this.songPrefix} ${query} ${this.songPostfix}`.trim()
        );
        console.log(result.body.tracks);
        items = result.body.tracks.items;
      }
      const relevantItems = items.filter((item) => !!item.preview_url);
      if (relevantItems.length === 0) {
        console.log(`🎷 Did not find anything, grabbing a random track...`);
        return random;
      }
      const { preview_url: url } = sample(relevantItems);
      try {
        await download(url, filename);
        return filename;
      } catch (err) {
        console.log('Error saving song', err);
      }
      return url;
    } catch (error) {
      console.error(error);
      console.log(`🎷 Grabbing a random track...`);
      return random;
    }
  }

  async createVideoPost(
    text,
    video,
    tags = [],
    sourceUrl = undefined,
    publishState = undefined
  ) {
    const videoContent = {
      type: 'video',
      media: createReadStream(video),
    };
    const textContent = { type: 'text', text };
    const response = await this.client.createPost(this.blogName, {
      tags,
      state: publishState,
      source_url: sourceUrl,
      content: [videoContent, textContent],
    });

    return response;
  }

  async generateAndShareVideo(story, image, tags, sourceUrl, publishState) {
    const wav = `${image}.wav`;
    const mp4 = `${image}.mp4`;

    await this.textToSpeech(story, wav);
    this.createVideo(image, wav, mp4);
    await this.addSoundtrack(image, mp4, story);

    console.log('Posting', {
      tags,
      sourceUrl,
      story,
      publishState,
    });

    const result = await this.createVideoPost(
      story,
      mp4,
      tags,
      sourceUrl,
      publishState
    );

    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${result.id}`
    );
    console.log('👋 Wrapping up!');
    unlinkSync(wav);
    unlinkSync(mp4);
  }

  getBaseParams(apiPath) {
    return {
      ...this.client.requestOptions,
      url: this.client.baseUrl + apiPath,
      oauth: this.client.credentials,
    };
  }

  async createVideoPostNpf(videos, tags, text, sourceUrl, publishState) {
    const videoContent = videos.map((video) => {
      return {
        type: 'video',
        media: createReadStream(video),
      };
    });

    const textBlocks = (text || '')
      .split(/\n/)
      .map((text) => ({ type: 'text', text }));

    const result = await this.makeNpfRequestForm(
      `/v2/blog/${this.blogName}/posts`,
      formData,
      {
        tags,
        state: publishState || 'published',
        source_url: sourceUrl,
        content: [...videoContent, ...textBlocks],
      }
    );
    console.log(result);
    return result.response;
  }

  async postVideo(
    images,
    captions,
    tags = [],
    sourceUrl = null,
    publishState = undefined,
    reblogInfo = null,
    useStory = false
  ) {
    if (publishState) {
      console.log(`👀 Will be making a ${publishState}`);
    }
    const image = this.getImage(images);
    let story = useStory ? captions.join(' ') : null;
    try {
      if (!story) {
        story = await this.generateStory(captions);
        if (!story || story.length === 0) {
          console.error('💥 Got no story, so leaving');
          process.exit(0);
        }
      }
      await this.generateAndShareVideo(
        story,
        image,
        tags,
        sourceUrl,
        publishState
      );
    } catch (err) {
      console.error(err);
      if (reblogInfo && story) {
        console.warn(`💥 Giving up`);
      }
    }
  }
}

module.exports = FieriFiction;
