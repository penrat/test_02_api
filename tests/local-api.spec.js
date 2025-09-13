const { test, expect } = require('@playwright/test');
const { start } = require('../src/server');
const { resetStore } = require('../src/app');

let server;
const baseURL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  server = await start(3000);
  resetStore();
});

test.afterAll(async () => {
  if (server) await new Promise((r) => server.close(r));
});

test('GET /health', async ({ request }) => {
  const res = await request.get(`${baseURL}/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('status', 'ok');
});

test('POST -> GET -> PUT -> PATCH -> DELETE flow', async ({ request }) => {
  // Create
  const createRes = await request.post(`${baseURL}/users`, {
    data: { name: 'Morpheus', job: 'leader' },
    headers: { 'Content-Type': 'application/json' }
  });
  expect(createRes.status()).toBe(201);
  const created = await createRes.json();
  expect(created).toHaveProperty('id');
  const id = created.id;

  // GET after POST
  const getAfterPost = await request.get(`${baseURL}/users/${id}`);
  expect(getAfterPost.status()).toBe(200);
  expect((await getAfterPost.json()).data).toMatchObject({ id, name: 'Morpheus', job: 'leader' });

  // PUT
  const putRes = await request.put(`${baseURL}/users/${id}`, {
    data: { name: 'Morpheus', job: 'zion resident' },
    headers: { 'Content-Type': 'application/json' }
  });
  expect(putRes.status()).toBe(200);

  // GET after PUT
  const getAfterPut = await request.get(`${baseURL}/users/${id}`);
  expect(getAfterPut.status()).toBe(200);
  expect((await getAfterPut.json()).data).toMatchObject({ id, name: 'Morpheus', job: 'zion resident' });

  // PATCH
  const patchRes = await request.patch(`${baseURL}/users/${id}`, {
    data: { job: 'the One' },
    headers: { 'Content-Type': 'application/json' }
  });
  expect(patchRes.status()).toBe(200);

  // GET after PATCH
  const getAfterPatch = await request.get(`${baseURL}/users/${id}`);
  expect(getAfterPatch.status()).toBe(200);
  expect((await getAfterPatch.json()).data).toMatchObject({ id, job: 'the One' });

  // DELETE
  const delRes = await request.delete(`${baseURL}/users/${id}`);
  expect(delRes.status()).toBe(204);

  // GET after DELETE
  const getAfterDelete = await request.get(`${baseURL}/users/${id}`);
  expect(getAfterDelete.status()).toBe(404);
});

