
module.exports = {
  async find(type = 'download') {
    const entities = await strapi.query('client', 'google-drive').find({
      status: true,
    });
    return entities;
  }
}