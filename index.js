const tumblr = require('tumblr.js');
const request = require('request-promise');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const { exec } = require('shelljs');
const { glob } = require('glob');

const WATSON_URL =
  'https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize';

const WATSON_VOICES = [
  'en-GB_KateVoice',
  'en-US_AllisonVoice',
  'en-US_LisaVoice',
  'en-US_MichaelVoice'
];

const VOICES = [
  {
    languageCode: 'en-gb',
    name: 'en-GB-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  {
    languageCode: 'en-gb',
    name: 'en-GB-Wavenet-B',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-gb',
    name: 'en-GB-Wavenet-C',
    ssmlGender: 'FEMALE'
  },
  {
    languageCode: 'en-gb',
    name: 'en-GB-Wavenet-D',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-gb',
    name: 'en-GB-Wavenet-D',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-A',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-B',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-C',
    ssmlGender: 'FEMALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-D',
    ssmlGender: 'MALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-E',
    ssmlGender: 'FEMALE'
  },
  {
    languageCode: 'en-us',
    name: 'en-US-Wavenet-F',
    ssmlGender: 'FEMALE'
  }
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
    watsonApiKey = null,
    textLength = 100
  } = {}) {
    this.client = tumblr.createClient({
      token: tumblrTokenKey,
      token_secret: tumblrTokenSecret,
      consumer_key: tumblrConsumerKey,
      consumer_secret: tumblrConsumerSecret,
      returnPromises: true
    });

    this.blogName = tumblrBlogName;
    this.textGeneratorUrl = textGeneratorUrl;
    this.audioGeneratorUrl = audioGeneratorUrl;
    this.textLength = textLength;
    this.watsonApiKey = watsonApiKey;
    this.loops = glob.sync(`${__dirname}/loops/*.mp3`);
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

  addSoundtrack(image, video, loop = null) {
    const useLoop = loop || this.getRandom(this.loops);
    const trim = this.isGif(image) ? 3 : 1;
    console.log(`\n🎷 Adding music: ${useLoop}`);
    const len = Math.floor(this.getVideoLength(video) - trim);
    const cmd = `ffmpeg -i "${video}" -filter_complex "amovie='${useLoop}':loop=999,loudnorm[s];[0][s]amix=duration=shortest" -t ${len} -y "temp-${video}" && rm "${video}" && mv "temp-${video}" "${video}"`;

    this.execCmd(cmd);
  }

  createVideo(image, audio, output) {
    console.log('\n📽️  Generating video');

    const loop = this.isGif(image) ? '-ignore_loop 0' : '-loop 1';

    return this.execCmd(
      `ffmpeg -i "${audio}" ${loop} -i "${image}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -shortest -strict -2 -c:v libx264 -threads 4 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y "${output}"`
    );
  }

  async reblogPost(reblogPostId, reblogName, tags, text) {
    console.log('\n🔄 Reblogging text post');
    const postInfo = await this.client.blogPosts(reblogName, {
      id: reblogPostId
    });
    const reblogKey = postInfo.posts[0].reblog_key;
    const response = await this.client.reblogPost(this.blogName, {
      id: reblogPostId,
      tags: tags.join(','),
      reblog_key: reblogKey,
      comment: text
    });
    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${
        response.id
      }`
    );
    return response;
  }

  async textToSpeech(text, output) {
    console.log('\n🕋 Synthesizing');

    const token = this.execCmd(
      'gcloud auth application-default print-access-token'
    ).trim();

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    };

    const dataString = JSON.stringify({
      input: {
        text
      },
      voice: this.getRandom(VOICES),
      audioConfig: {
        audioEncoding: 'MP3'
      }
    });

    const options = {
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      method: 'POST',
      headers: headers,
      body: dataString
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

  async generateAudio(text, output) {
    console.log('\n🕋 Talking to Watson');

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'audio/mp3'
    };

    const dataString = JSON.stringify({
      text
    });

    const options = {
      encoding: null,
      url: WATSON_URL,
      method: 'POST',
      headers: headers,
      body: dataString,
      qs: {
        voice: this.getRandom(WATSON_VOICES)
      },
      auth: {
        user: 'apikey',
        pass: this.watsonApiKey
      }
    };

    const response = await request(options);
    writeFileSync(output, response);
  }

  async generateStory(captions) {
    console.log('\n💭 Talking to Dreamscape');
    const input = this.captionsToString(captions);
    const req = await request({
      uri: this.textGeneratorUrl,
      qs: {
        q: input,
        length: this.textLength
      },
      json: true
    });
    if (!req || !req.output) {
      return null;
    }
    return this.getFullSentences(req.output);
  }

  async postVideo(story, image, tags, sourceUrl) {
    const mp3 = `${image}.mp3`;
    const mp4 = `${image}.mp4`;

    await this.textToSpeech(story, mp3);
    this.createVideo(image, mp3, mp4);
    this.addSoundtrack(image, mp4);

    const video = readFileSync(mp4);
    const videoPost = await this.client.createVideoPost(this.blogName, {
      data64: video.toString('base64'),
      tags: tags.join(','),
      caption: story,
      source_url: sourceUrl
    });

    console.log(
      `👀 Go check it out at https://${this.blogName}.tumblr.com/post/${
        videoPost.id
      }`
    );
    console.log('👋 Wrapping up!');
    unlinkSync(mp3);
    unlinkSync(mp4);
  }

  async post(image, captions, tags = [], sourceUrl = null, reblogInfo = null) {
    let story;
    try {
      story = await this.generateStory(captions);
      if (!story || story.length === 0) {
        console.error('💥 Got no story, so leaving');
        process.exit(0);
      }
      await this.postVideo(story, image, tags, sourceUrl);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
      if (reblogInfo && story) {
        console.warn(`💥 Trying to reblog instead as a last-ditch effort`);
        await this.reblogPost(
          reblogInfo.postId,
          reblogInfo.blogName,
          tags,
          story
        );
      }
    }
  }
}

module.exports = FieriFiction;
