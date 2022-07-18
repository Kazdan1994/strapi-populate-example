'use strict';

const { jest: requiredJest, beforeAll, afterAll, it, expect, afterEach} = require('@jest/globals');
const { setupStrapi, stopStrapi, setPublicPermissions} = require('../helpers/strapi');

requiredJest.setTimeout(30000);

const collections = [
  'article',
  'category'
];

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times

  await setPublicPermissions({
    profile: ['update'],
  });
});

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

afterEach(async () => {
  for (const collection of collections) {
    await strapi.query(`api::${collection}.${collection}`).deleteMany();
  }
  await strapi.query('plugin::users-permissions.user').deleteMany();
});

it('strapi is defined', (done) => {
  expect(strapi).toBeDefined();
  done();
});

require('./article');
