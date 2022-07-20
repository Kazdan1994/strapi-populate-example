'use strict';

/**
 * article router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::article.article', {
  config: {
    find: {
      policies: ['global::is-authenticated'],
      middlewares: ['global::belongs-to-user'],
    },
  },
});
