'use strict';

/**
 * `belongsToUser` middleware.
 */

module.exports = () => {
  // Add authenticated user to filter.
  return async (ctx, next) => {
    ctx.query.filters = {
      ...ctx.query.filters,
      author: ctx.state.user.id
    };

    await next();
  };
};
