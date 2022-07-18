const Strapi = require('@strapi/strapi');
const fs = require('fs');
const _ = require('lodash');

let instance;

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const waitForServer = () =>
  new Promise((resolve) => {
    const { host, port } = strapi.config.get('server');
    resolve(strapi.server.listen(port, host));
  });

/**
 * Setups strapi for futher testing
 */
async function setupStrapi() {
  if (!instance) {
    /** the following code in copied from `./node_modules/strapi/lib/Strapi.js` */
    await Strapi().load();
    await waitForServer();

    instance = strapi; // strapi is global now
  }
  return instance;
}

/**
 * Closes strapi after testing
 */
async function stopStrapi() {
  if (instance) {
    const tmpDbFile = strapi.config.get(
      'database.connection.connection.filename'
    );

    instance.destroy();

    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
  return instance;
}

/**
 * Returns valid JWT token for authenticated
 * @param {String | number} idOrEmail, either user id, or email
 */
const jwt = (idOrEmail) =>
  strapi.plugins['users-permissions'].services.jwt.issue({
    [Number.isInteger(idOrEmail) ? 'id' : 'email']: idOrEmail,
  });

/**
 * Grants database `permissions` table that role can access an endpoint/controllers
 *
 * @param {int} roleID, 1 Authenticated, 2 Public, etc
 * @param {string} path
 * @param {boolean} enabled, default true
 * @param {string} policy, default ''
 */
const grantPrivilege = async (
  roleID = 1,
  path,
  enabled = true,
  policy = ''
) => {
  const service = strapi.plugin('users-permissions').service('role');

  const role = await service.findOne(roleID);

  _.set(role.permissions, path, { enabled, policy });

  return service.updateRole(roleID, role);
};

/** Updates database `permissions` that role can access an endpoint
 * @see grantPrivilege
 */

const grantPrivileges = async (roleID = 1, values = []) => {
  await Promise.all(values.map((val) => grantPrivilege(roleID, val)));
};

/**
 * Updates the core of strapi
 * @param {*} pluginName
 * @param {*} key
 * @param {*} newValues
 * @param {*} environment
 */
const updatePluginStore = async (
  pluginName,
  key,
  newValues,
  environment = ''
) => {
  const pluginStore = strapi.store({
    environment: environment,
    type: 'plugin',
    name: pluginName,
  });

  const oldValues = await pluginStore.get({ key });
  const newValue = Object.assign({}, oldValues, newValues);

  return pluginStore.set({ key: key, value: newValue });
};

/**
 * Get plugin settings from store
 * @param {*} pluginName
 * @param {*} key
 * @param {*} environment
 */
const getPluginStore = (pluginName, key, environment = '') => {
  const pluginStore = strapi.store({
    environment: environment,
    type: 'plugin',
    name: pluginName,
  });

  return pluginStore.get({ key });
};

/**
 * Check if response error contains error with given ID
 * @param {string} errorId ID of given error
 * @param {object} response Response object from strapi controller
 * @example
 *
 * const response =  {
      data: null,
      error: {
        status: 400,
        name: 'ApplicationError',
        message: 'Your account email is not confirmed',
        details: {}
      }
    }
 * responseHasError("ApplicationError", response) // true
 */
const responseHasError = (errorId, response) => {
  return response && response.error && response.error.name === errorId;
};

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: {
        type: 'public',
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

/**
 * Default data that factory use
 */
const defaultData = {
  password: '1234Abc',
  provider: 'local',
  confirmed: true,
};

/**
 * Returns random username object for user creation
 * @param {object} options that overwrites default options
 * @returns {object} object that is used with `strapi.plugins["users-permissions"].services.user.add`
 */
const mockUserData = (options = {}) => {
  return {
    username: 'John Doe',
    email: 'john@doe.fr',
    ...defaultData,
    ...options,
  };
};

/**
 * Creates new user in strapi database
 * @param data
 * @returns {object} object of new created user, fetched from database
 */
const createUser = async (data) => {
  /** Gets the default user role */
  const pluginStore = await strapi.store({
    type: 'plugin',
    name: 'users-permissions',
  });

  const settings = await pluginStore.get({
    key: 'advanced',
  });

  const defaultRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: settings.default_role } });

  /** Creates a new user and push to database */
  return strapi
    .plugin('users-permissions')
    .service('user')
    .add({
      ...mockUserData(),
      ...data,
      role: defaultRole ? defaultRole.id : null,
    });
};

module.exports = {
  setupStrapi,
  stopStrapi,
  jwt,
  grantPrivilege,
  grantPrivileges,
  updatePluginStore,
  getPluginStore,
  responseHasError,
  sleep,
  setPublicPermissions,
  createUser,
};
