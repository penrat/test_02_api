const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let nextId = 1;
const users = new Map();

// Seed a couple of users for convenience
users.set(nextId, { id: nextId, name: 'Alice', job: 'leader' }); nextId++;
users.set(nextId, { id: nextId, name: 'Bob', job: 'resident' }); nextId++;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// List users
app.get('/users', (req, res) => {
  res.json({ data: Array.from(users.values()) });
});

// Get a single user
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: user });
});

// Create user
app.post('/users', (req, res) => {
  const { name, job } = req.body || {};
  if (!name || !job) return res.status(400).json({ error: 'name and job are required' });
  const id = nextId++;
  const user = { id, name, job };
  users.set(id, user);
  res.status(201).json({ ...user, createdAt: new Date().toISOString() });
});

// Replace user
app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!users.has(id)) return res.status(404).json({ error: 'User not found' });
  const { name, job } = req.body || {};
  if (!name || !job) return res.status(400).json({ error: 'name and job are required' });
  const user = { id, name, job };
  users.set(id, user);
  res.json({ ...user, updatedAt: new Date().toISOString() });
});

// Partial update
app.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = users.get(id);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  const updates = req.body || {};
  const updated = { ...existing, ...updates, id };
  users.set(id, updated);
  res.json({ ...updated, updatedAt: new Date().toISOString() });
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!users.has(id)) return res.status(404).json({ error: 'User not found' });
  users.delete(id);
  res.status(204).send();
});

// Utilities for tests
function resetStore() {
  users.clear();
  nextId = 1;
  users.set(nextId, { id: nextId, name: 'Alice', job: 'leader' }); nextId++;
  users.set(nextId, { id: nextId, name: 'Bob', job: 'resident' }); nextId++;
}

module.exports = { app, resetStore };

