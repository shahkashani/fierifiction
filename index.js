const tumblr = require('tumblr.js');
const request = require('request-promise');
const Spotify = require('node-spotify-api');
const {
  writeFileSync,
  readFileSync,
  unlinkSync,
  createReadStream,
  createWriteStream,
} = require('fs');
const { exec } = require('shelljs');
const { glob } = require('glob');
const { sample, truncate } = require('lodash');
const deepai = require('deepai');
const speachSdk = require('microsoft-cognitiveservices-speech-sdk');

const ATTEMPS = 3;

const VOICES = [
  {
    name: 'en-US-AmberNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-BrandonNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-GB-LibbyNeural',
    region: 'United Kingdom',
    code: 'en-GB',
  },
  {
    name: 'en-GB-RyanNeural',
    region: 'United Kingdom',
    code: 'en-GB',
  },
  {
    name: 'en-AU-NatashaNeural',
    region: 'Australia',
    code: 'en-AU',
  },
  {
    name: 'en-AU-WilliamNeural',
    region: 'Australia',
    code: 'en-AU',
  },
  {
    name: 'en-CA-ClaraNeural',
    region: 'Canada',
    code: 'en-CA',
  },
  {
    name: 'en-CA-LiamNeural',
    region: 'Canada',
    code: 'en-CA',
  },
  {
    name: 'en-HK-YanNeural',
    region: 'Hongkong',
    code: 'en-HK',
  },
  {
    name: 'en-HK-SamNeural',
    region: 'Hongkong',
    code: 'en-HK',
  },
  {
    name: 'en-IN-NeerjaNeural',
    region: 'India',
    code: 'en-IN',
  },
  {
    name: 'en-IN-PrabhatNeural',
    region: 'India',
    code: 'en-IN',
  },
  {
    name: 'en-IE-EmilyNeural',
    region: 'Ireland',
    code: 'en-IE',
  },
  {
    name: 'en-IE-ConnorNeural',
    region: 'Ireland',
    code: 'en-IE',
  },
  {
    name: 'en-KE-AsiliaNeural',
    region: 'Kenya',
    code: 'en-KE',
  },
  {
    name: 'en-KE-ChilembaNeural',
    region: 'Kenya',
    code: 'en-KE',
  },
  {
    name: 'en-NZ-MollyNeural',
    region: 'New Zealand',
    code: 'en-NZ',
  },
  {
    name: 'en-NZ-MitchellNeural',
    region: 'New Zealand',
    code: 'en-NZ',
  },
  {
    name: 'en-NG-EzinneNeural',
    region: 'Nigeria',
    code: 'en-NG',
  },
  {
    name: 'en-NG-AbeoNeural',
    region: 'Nigeria',
    code: 'en-NG',
  },
  {
    name: 'en-PH-RosaNeural',
    region: 'Philippines',
    code: 'en-PH',
  },
  {
    name: 'en-PH-JamesNeural',
    region: 'Philippines',
    code: 'en-PH',
  },
  {
    name: 'en-SG-LunaNeural',
    region: 'Singapore',
    code: 'en-SG',
  },
  {
    name: 'en-SG-WayneNeural',
    region: 'Singapore',
    code: 'en-SG',
  },
  {
    name: 'en-ZA-LeahNeural',
    region: 'South Africa',
    code: 'en-ZA',
  },
  {
    name: 'en-ZA-LukeNeural',
    region: 'South Africa',
    code: 'en-ZA',
  },
  {
    name: 'en-TZ-ImaniNeural',
    region: 'Tanzania',
    code: 'en-TZ',
  },
  {
    name: 'en-TZ-ElimuNeural',
    region: 'Tanzania',
    code: 'en-TZ',
  },
  {
    name: 'en-GB-SoniaNeural',
    region: 'United Kingdom',
    code: 'en-GB',
  },
  {
    name: 'en-US-AriaNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-AshleyNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-CoraNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-ElizabethNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-JennyNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-MichelleNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-MonicaNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-SaraNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-AnaNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-ChristopherNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-EricNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-GuyNeural',
    region: 'United States',
    code: 'en-US',
  },
  {
    name: 'en-US-JacobNeural',
    region: 'United States',
    code: 'en-US',
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
    spotifyClientId = null,
    spotifyClientSecret = null,
    moderation = null,
    music = '*.mp3',
    textLength = 250,
    speakingRate = 1,
    songPrefix = '',
    songPostfix = 'instrumental',
    pitch = 0,
    textGeneratorApiKey,
    microsoftAzureSpeechToken,
    microsoftAzureSpeechRegion,
  } = {}) {
    this.client = tumblr.createClient({
      token: tumblrTokenKey,
      token_secret: tumblrTokenSecret,
      consumer_key: tumblrConsumerKey,
      consumer_secret: tumblrConsumerSecret,
      returnPromises: true,
    });
    this.songPrefix = songPrefix;
    this.songPostfix = songPostfix;
    this.moderation = moderation;
    this.blogName = tumblrBlogName;
    this.textGeneratorUrl = textGeneratorUrl;
    this.textGeneratorApiKey = textGeneratorApiKey;
    this.audioGeneratorUrl = audioGeneratorUrl;
    this.textLength = textLength;
    this.speakingRate = speakingRate;
    this.pitch = pitch;
    this.music = music;
    this.loops = glob.sync(`${__dirname}/loops/${this.music}`);
    if (spotifyClientId && spotifyClientSecret) {
      this.spotify = new Spotify({
        id: spotifyClientId,
        secret: spotifyClientSecret,
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
  async textToSpeech(text, output) {
    console.log('\n🕋 Synthesizing');
    const input = this.replacements(text);

    const { name, code, region } = sample(VOICES);
    this.speechConfig.speechSynthesisLanguage = code;
    this.speechConfig.speechSynthesisVoiceName = name;
    console.log(`\n🕋 Voice: ${name} / ${code} / ${region}`);

    const synthesizer = new speachSdk.SpeechSynthesizer(this.speechConfig);
    await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        input,
        (result) => {
          synthesizer.close();
          writeFileSync(output, result.audioData);
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
        const result = await this.spotify.search({
          query: `${this.songPrefix} ${query} ${this.songPostfix}`.trim(),
          type: 'track',
        });
        items = result.tracks.items;
      }
      const relevantItems = items.filter((item) => !!item.preview_url);
      if (relevantItems.length === 0) {
        console.log(`🎷 Did not find anything, grabbing a random track...`);
        return random;
      }
      const { preview_url: url } = sample(relevantItems);
      try {
        const response = await request({
          url,
          encoding: null,
        });
        const buffer = Buffer.from(response, 'utf8');
        writeFileSync(filename, buffer);
        return filename;
      } catch (err) {
        console.log('Error saving song', err);
      }
      return preview_url;
    } catch (error) {
      console.error(error);
      console.log(`🎷 Grabbing a random track...`);
      return random;
    }
  }

  async generateAndShareVideo(story, image, tags, sourceUrl, publishState) {
    const wav = `${image}.wav`;
    const mp4 = `${image}.mp4`;

    await this.textToSpeech(story, wav);
    this.createVideo(image, wav, mp4);
    await this.addSoundtrack(image, mp4, story);

    const video = readFileSync(mp4);
    const caption = story.replace(/\n/g, '<br />\n');
    const tagStr = tags.join(',');

    console.log('Posting', {
      tagStr,
      sourceUrl,
      caption,
      publishState,
    });

    const videoPost = await this.client.createVideoPost(this.blogName, {
      caption,
      data64: video.toString('base64'),
      tags: tagStr,
      source_url: sourceUrl,
      state: publishState || 'published',
    });

    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${videoPost.id}`
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

  async makeNpfRequestForm(apiPath, formData, body) {
    return new Promise((resolve, reject) => {
      this.client.request.post(
        {
          ...this.getBaseParams(apiPath),
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          formData: {
            json: JSON.stringify(body),
            ...formData,
          },
        },
        (err, _response, body) => {
          if (err) {
            return reject(err);
          }
          try {
            body = JSON.parse(body);
          } catch (e) {
            return reject(`Malformed Response: ${body}`);
          }
          resolve(body);
        }
      );
    });
  }

  async createVideoPostNpf(videos, tags, text, sourceUrl, publishState) {
    const formData = videos.reduce((memo, video, index) => {
      memo[`video${index}`] = createReadStream(video);
      return memo;
    }, {});

    const videoContent = videos.map((_video, index) => {
      return {
        type: 'video',
        media: [
          {
            type: 'video/mp4',
            identifier: `video${index}`,
          },
        ],
      };
    });

    const textBlocks = (text || '')
      .split(/\n/)
      .map((text) => ({ type: 'text', text }));

    const result = await this.makeNpfRequestForm(
      `/v2/blog/${this.blogName}/posts`,
      formData,
      {
        tags: tags.join(','),
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
      console.error(err);
    }
  }
}

module.exports = FieriFiction;
