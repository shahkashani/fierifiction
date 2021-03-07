const tumblr = require('tumblr.js');
const request = require('request-promise');
const Spotify = require('node-spotify-api');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const { exec } = require('shelljs');
const { glob } = require('glob');

const EN_VOICES = [
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-A',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-F',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-GB'],
    name: 'en-GB-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-US'],
    name: 'en-US-Standard-E',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-A',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-B',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-C',
    ssmlGender: 'FEMALE',
    naturalSampleRateHertz: 24000,
  },
  {
    languageCodes: ['en-AU'],
    name: 'en-AU-Standard-D',
    ssmlGender: 'MALE',
    naturalSampleRateHertz: 24000,
  },
];

class FieriFiction {
  constructor({
    tumblrConsumerKey = null,
    tumblrConsumerSecret = null,
    tumblrTokenKey = null,
    tumblrTokenSecret = null,
    tumblrBlogName = null,
    textGeneratorUrl = null,
    audioGeneratorUrl = null,
    googleCloudCredentials = null,
    spotifyClientId = null,
    spotifyClientSecret = null,
    music = '*.mp3',
    textLength = 100,
    topK = 40,
    temperature = 1,
    speakingRate = 1,
    pitch = 0,
  } = {}) {
    this.client = tumblr.createClient({
      token: tumblrTokenKey,
      token_secret: tumblrTokenSecret,
      consumer_key: tumblrConsumerKey,
      consumer_secret: tumblrConsumerSecret,
      returnPromises: true,
    });

    this.blogName = tumblrBlogName;
    this.textGeneratorUrl = textGeneratorUrl;
    this.audioGeneratorUrl = audioGeneratorUrl;
    this.textLength = textLength;
    this.speakingRate = speakingRate;
    this.pitch = pitch;
    this.music = music;
    this.topK = topK;
    this.temperature = temperature;
    this.googleCloudCredentials = googleCloudCredentials;
    this.loops = glob.sync(`${__dirname}/loops/${this.music}`);
    if (spotifyClientId && spotifyClientSecret) {
      this.spotify = new Spotify({
        id: spotifyClientId,
        secret: spotifyClientSecret,
      });
    }
  }

  captionsToString(captions) {
    return captions
      .join(' ')
      .replace(/\\n/gi, ' ')
      .replace(/\s{2,}/, ' ');
  }

  getFullSentences(string) {
    const match = string.match(/[.!?]/gi);
    const lastIndex = string.lastIndexOf(match[match.length - 1]);
    return string.slice(0, lastIndex + 1);
  }

  closeQuotes(string) {
    const count = (string.match(/\"/g) || []).length;
    return count === 0 || count % 2 === 0
      ? string
      : string.replace(/([.!?])$/, '"$1');
  }

  execCmd(cmd) {
    const result = exec(cmd, { silent: true });
    if (result.code !== 0) {
      console.error(`🐞 Oops: ${result.stderr}\n> ${cmd}`);
    }
    return result;
  }

  getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
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

  async reblogPost(text, postId, blogName, tags = []) {
    console.log('\n🔄 Reblogging text post');
    const postInfo = await this.client.blogPosts(blogName, {
      id: postId,
    });
    const reblogKey = postInfo.posts[0].reblog_key;
    const response = await this.client.reblogPost(this.blogName, {
      id: postId,
      tags: tags.join(','),
      reblog_key: reblogKey,
      comment: text,
    });
    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${response.id}`
    );
    return response;
  }

  // I truly hate Google Cloud's dependency on authentication files
  execAuthGcloudCmd(cmd) {
    if (!this.googleCloudCredentials) {
      return this.execCmd(cmd).trim();
    }
    const tmpFile = '.creds.json';
    writeFileSync(tmpFile, this.googleCloudCredentials);
    const result = this.execCmd(
      `GOOGLE_APPLICATION_CREDENTIALS=${tmpFile} ${cmd}`
    ).trim();
    unlinkSync(tmpFile);
    return result;
  }

  async textToSpeech(text, output) {
    console.log('\n🕋 Synthesizing');

    const token = this.execAuthGcloudCmd(
      'gcloud auth application-default print-access-token'
    );

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    };

    const { languageCodes, ssmlGender, name } = this.getRandom(EN_VOICES);

    const paramVoice = {
      ssmlGender,
      name,
      languageCode: languageCodes[0],
    };

    const dataString = JSON.stringify({
      input: {
        text,
      },
      voice: paramVoice,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: this.speakingRate,
        pitch: this.pitch,
      },
    });

    const options = {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      method: 'POST',
      headers: headers,
      body: dataString,
    };

    try {
      const response = await request(options);
      const audioContent = JSON.parse(response).audioContent;
      const buffer = Buffer.from(audioContent, 'base64');
      writeFileSync(output, buffer);
    } catch (err) {
      console.error(`💥 Could not save mp3 (with token: ${token}):`, err);
    }
  }

  async generateStory(captions) {
    const params = {
      length: this.textLength,
      top_k: this.topK,
      temperature: this.temperature,
    };
    console.log(`\n💭 Talking to Dreamscape (${JSON.stringify(params)})`);
    const input = this.captionsToString(captions);
    const req = await request({
      uri: this.textGeneratorUrl,
      qs: {
        q: input,
        ...params,
      },
      json: true,
    });
    if (!req || !req.output) {
      return null;
    }
    return this.closeQuotes(this.getFullSentences(req.output));
  }

  async getSong(story) {
    const random = this.getRandom(this.loops);
    if (!this.spotify || !story) {
      console.log(`🎷 Grabbing a random track...`);
      return random;
    }

    const filename = `temp-${this.getQuery(story)
      .toLowerCase()
      .replace(/ /g, '-')}.mp3`;

    let attempts = [];

    for (let i = 4; i > 0; i -= 1) {
      attempts.push(`${this.getQuery(story, i)} instrumental`);
    }

    for (let j = 4; j > 0; j -= 1) {
      attempts.push(`${this.getQuery(story, j)}`);
    }

    try {
      let items = [];
      while (attempts.length > 0 && items.length === 0) {
        let query = attempts.shift();
        console.log(`🎷 Searching for "${query}"...`);
        const result = await this.spotify.search({
          query: `${query} instrumental`,
          type: 'track',
        });
        items = result.tracks.items;
      }
      if (items.length === 0) {
        console.log(`🎷 Did not find anything, grabbing a random track...`);
        return random;
      }
      const { preview_url: url } = this.getRandom(items);
      try {
        const response = await request({
          url,
          encoding: null,
        });
        const buffer = Buffer.from(response, 'utf8');
        writeFileSync(filename, buffer);
        return filename;
      } catch (err) {
        console.log('error saving');
      }
      return preview_url;
    } catch (error) {
      console.error(error);
      console.log(`🎷 Grabbing a random track...`);
      return random;
    }
  }

  async generateAndShareVideo(story, image, tags, sourceUrl) {
    const mp3 = `${image}.mp3`;
    const mp4 = `${image}.mp4`;

    await this.textToSpeech(story, mp3);
    this.createVideo(image, mp3, mp4);
    await this.addSoundtrack(image, mp4, story);

    const video = readFileSync(mp4);
    const videoPost = await this.client.createVideoPost(this.blogName, {
      data64: video.toString('base64'),
      tags: tags.join(','),
      caption: story,
      source_url: sourceUrl,
    });

    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${videoPost.id}`
    );
    console.log('👋 Wrapping up!');
    unlinkSync(mp3);
    unlinkSync(mp4);
  }

  async postVideo(
    images,
    captions,
    tags = [],
    sourceUrl = null,
    reblogInfo = null,
    useStory = false
  ) {
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
      await this.generateAndShareVideo(story, image, tags, sourceUrl);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
      if (reblogInfo && story) {
        console.warn(`💥 Trying to reblog instead as a last-ditch effort`);
        await this.reblogPost(
          story,
          reblogInfo.postId,
          reblogInfo.blogName,
          tags
        );
      }
    }
  }

  async postText(captions, postId, blogName, tags = [], useStory = false) {
    try {
      const story = useStory
        ? captions.join(' ')
        : await this.generateStory(captions);
      await this.reblogPost(story, postId, blogName, tags);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
    }
  }
}

module.exports = FieriFiction;
