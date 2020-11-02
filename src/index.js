var fasquest = require('fasquest');
const client = {
  https: require('https')
};

fasquest.agent = {
  https: new client.https.Agent({
    keepAlive: false
  })
};

class Checker {
  constructor(config, service, settings) {
    this.config = config;
    this.service = service;
    this.settings = settings;
  }

  async init() {}

  async check() {
    try {
      var res = await fasquest.request({
        uri: 'https://www.cloudflarestatus.com/api/v2/status.json',
        method: 'GET',
        simple: false,
        resolveWithFullResponse: true,
        headers: {
          'User-Agent': `Sky-Puppy / ${this.config.skypuppy.version} (Health Check Service)`
        }
      });
      var code = 500;

      switch (res.body.status.indicator) {
        case 'none':
          code = 200;
          break;
        case 'minor':
          code = 490;
          break;
        case 'major':
          code = 491;
          break;
        case 'critical':
          code = 492;
          break;
      }
      return {
        code: code,
        message: res.body.status.description
      };
    } catch (e) {
      return {
        code: 500,
        message: 'Can not connect to cloudflarestatus.com'
      };
    }
  }
}

module.exports = function(config, service, settings) {
  return new Checker(config, service, settings);
};
