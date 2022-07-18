const {it, describe, expect} = require('@jest/globals');
const request = require('supertest');
const {createUser, jwt, grantPrivilege} = require('../../helpers/strapi');

describe('article test', () => {
  it('should get articles', async () => {
    const user = await createUser();
    const article = await strapi.query('api::article.article').create({
      data: {
        title: 'article #1',
        author: [user.id]
      }
    });

    const token = await jwt(user.id);

    await grantPrivilege(1, 'api::article.controllers.article.find');

    const response = await request(strapi.server.httpServer)
      .get('/api/articles')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data[0].id).toBe(article.id);
  });

  it('should get articles with relationships', async () => {
    const user = await createUser();
    await strapi.query('api::article.article').create({
      data: {
        title: 'article #1',
        author: [user.id]
      }
    });

    const token = await jwt(user.id);

    await grantPrivilege(1, 'api::article.controllers.article.find');

    const response = await request(strapi.server.httpServer)
      .get('/api/articles?populate=%2A')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty('author');
    expect(response.body.data[0].author.id).toMatchObject(user.id);
  });
});
