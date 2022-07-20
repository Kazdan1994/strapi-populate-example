'use strict';

/**
 * `parse-body` middleware.
 */

module.exports = () => {
  return async (ctx, next) => {
    if (typeof ctx.request.body === 'string') {
      ctx.request.body = JSON.parse(ctx.request.body);
    }

    await next();
  };
};
