const tumblr = require('tumblr.js');
const request = require('request-promise');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const { exec } = require('shelljs');
const { glob } = require('glob');

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
    googleCloudCredentials = null,
    textLength = 100,
    speakingRate = 1,
    pitch = 0
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
    this.speakingRate = speakingRate;
    this.pitch = pitch;
    this.googleCloudCredentials = googleCloudCredentials;
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
      `ffmpeg -i "${audio}" ${loop} -i "${image}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -shortest -strict -2 -c:v libx264 -threads 4 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y -af extrastereo,lowpass=3000,highpass=200,alimiter "${output}"`
    );
  }

  async reblogPost(text, postId, blogName, tags = []) {
    console.log('\n🔄 Reblogging text post');
    const postInfo = await this.client.blogPosts(blogName, {
      id: postId
    });
    const reblogKey = postInfo.posts[0].reblog_key;
    const response = await this.client.reblogPost(this.blogName, {
      id: postId,
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
      'Content-Type': 'application/json; charset=utf-8'
    };

    const dataString = JSON.stringify({
      input: {
        text
      },
      voice: this.getRandom(VOICES),
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: this.speakingRate,
        pitch: this.pitch
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
    return this.closeQuotes(this.getFullSentences(req.output));
  }

  async generateAndShareVideo(story, image, tags, sourceUrl) {
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

  async postVideo(
    image,
    captions,
    tags = [],
    sourceUrl = null,
    reblogInfo = null
  ) {
    let story;
    try {
      story = await this.generateStory(captions);
      if (!story || story.length === 0) {
        console.error('💥 Got no story, so leaving');
        process.exit(0);
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

  async postText(captions, postId, blogName, tags = []) {
    try {
      const story = await this.generateStory(captions);
      await this.reblogPost(story, postId, blogName, tags);
    } catch (err) {
      console.error(`💥 Something borked: ${err}`);
    }
  }
}

module.exports = FieriFiction;
