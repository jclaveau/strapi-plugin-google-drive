'use strict';
const { google } = require('googleapis');

/**
 * google-drive.js controller
 *
 * @description: A set of functions called "actions" of the `google-drive` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  findClient: async (ctx) => {
    const clients = await strapi.plugins['google-drive'].services.client.find();

    ctx.send(clients);
  },

  async getAccessToken(ctx) {
    const type = ctx.query.type || 'download';
    if (!['download', 'upload'].includes(type)) {
      return ctx.badRequest('Type invalid');
    }
    const account = await strapi.plugins['google-drive'].services.account.findOne({type});
    if (!account) {
      return ctx.throw('Not found any account');
    }
    const token = await strapi.plugins['google-drive'].services.drive.getAccessToken(type);
    ctx.body = {access_token: token};
  },

  redeem: async (ctx) => {
    const { id, client_id, client_secret, code } = ctx.request.body;

    try {
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      const { tokens } = await oAuth2Client.getToken(code);
      const { expiry_date, scopes, email, email_verified, access_type, sub } = await oAuth2Client.getTokenInfo(tokens.access_token);
      const account = await strapi.plugins['google-drive'].services.account.create({
        email: email,
        scopes: scopes.join(' '),
        token: tokens,
        client: id,
        type: scopes.indexOf('https://www.googleapis.com/auth/drive') > -1 ? 'upload' : 'download',
      });

      ctx.send({
        status: 'ok',
        data: account
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
    
  }
};
