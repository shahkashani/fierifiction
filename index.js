const tumblr = require('tumblr.js');

class FieriFiction {
  constructor({
    consumerKey = null,
    consumerSecret = null,
    token = null,
    tokenSecret = null,
    blogName = null,
    textGeneratorUrl = null
  }) {
    this.client = tumblr.createClient({
      token,
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token_secret: tokenSecret,
      returnPromises: true
    });
    this.reblog = reblog;
    this.tags = tags;
    this.blogName = blogName;
    this.textGeneratorUrl = textGeneratorUrl;
  }

  postStory(text, tags) {
    console.log(text, tags);
  }
}

module.exports = FieriFiction;
