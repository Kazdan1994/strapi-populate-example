'use strict';

/**
 * `is-authenticated` policy.
 */

module.exports = (policyContext) => {
  return !!policyContext.state.user;
};
