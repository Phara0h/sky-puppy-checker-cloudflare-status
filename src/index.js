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
        uri: 'https://cloudflarestatus.com/api/v2/components.json',
        method: 'GET',
        simple: false,
        resolveWithFullResponse: true,
        headers: {
          'User-Agent': `Sky-Puppy / ${this.config.skypuppy.version} (Health Check Service)`
        }
      });
      var code = 500;
      var components = res.body.components;
      var overallStatus = 'unknown';
      var group = '';
      var message = '';

      for (var i = 0; i < components.length; i++) {
        if (components[i].name == 'Cloudflare Sites and Services') {
          overallStatus = components[i].status;
          group = components[i].id;
        } else if (
          components[i].group_id == group &&
          components[i].status != 'operational'
        ) {
          message += `${components[i].name}:${components[i].status}, `;
        }
      }

      //remove trailling comma
      if (message != '') {
        message = message.slice(0, -2);
      }

      switch (overallStatus) {
        case 'operational':
          code = 200;
          message = 'All systems are operational!';
          break;
        case 'degraded_performance':
          code = 490;
          break;
        case 'partial_outage':
          code = 491;
          break;
        case 'major_outage':
          code = 492;
          break;
        case 'unknown':
          code = 500;
          message = 'Unknown';
      }
      return {
        code,
        message
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
