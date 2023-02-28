'use strict';

/**
 *  article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', () => ({
  async create(ctx) {
    console.log(ctx.request.files);

    return super.create(ctx);
  }
}));
