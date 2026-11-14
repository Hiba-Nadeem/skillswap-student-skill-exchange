const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { randomBytes } = require("node:crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const seedSkills = require("../utils/seedSkills");
const User = require("../models/User");
const Review = require("../models/Review");
const Message = require("../models/Message");

test("two students complete a persisted skill exchange with authorization checks", { timeout: 120000 }, async (t) => {
  // This suite always uses a new isolated database; it never loads .env.
  process.env.JWT_SECRET = randomBytes(32).toString("hex");
  const database = await MongoMemoryServer.create();
  t.after(async () => { await mongoose.disconnect(); await database.stop(); });
  await mongoose.connect(database.getUri("skillswap_test"));
  await Promise.all([User.init(), Review.init()]);
  await seedSkills();
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function api(method, route, body, token, expected = 200) {
    const response = await fetch(base + route, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(result)}`);
    return result;
  }
  const password = "Test-password-123";
  async function register(name) {
    return api("POST", "/auth/register", { name, email: `${name}@example.test`, password, university: "Test University" }, undefined, 201);
  }
  const a = await register("Alice");
  const b = await register("Bob");
  const outsider = await register("Charlie");
  assert.ok(a.token);
  assert.equal(a.user.password, undefined);
  const stored = await User.findById(a.user._id).select("+password");
  assert.notEqual(stored.password, password);
  assert.ok(await bcrypt.compare(password, stored.password));
  await api("GET", "/auth/me", undefined, undefined, 401);
  await api("POST", "/auth/login", { email: "Alice@example.test", password: "incorrect" }, undefined, 401);
  const login = await api("POST", "/auth/login", { email: "Alice@example.test", password });
  assert.equal(login.user._id, a.user._id);
  const skills = await api("GET", "/skills");
  assert.equal(skills.length, 24);
  const python = skills.find((skill) => skill.name === "Python")._id;
  const photoshop = skills.find((skill) => skill.name === "Photoshop")._id;
  await api("PUT", "/users/profile", { bio: "Python tutor", skillsToTeach: [python], skillsToLearn: [photoshop] }, a.token);
  await api("PUT", "/users/profile", { skillsToTeach: [photoshop], skillsToLearn: [python] }, b.token);
  const search = await api("GET", `/users?skill=${photoshop}&q=Bob`, undefined, a.token);
  assert.deepEqual(search.map((user) => user._id), [b.user._id]);
  const { matches } = await api("GET", "/matches", undefined, a.token);
  assert.deepEqual(matches.map((match) => [match.user._id, match.score]), [[b.user._id, 2]]);
  await api("POST", `/messages/${b.user._id}`, { text: "Too early" }, a.token, 403);
  const request = await api("POST", "/requests", { receiverId: b.user._id, skillWanted: photoshop, skillOffered: python }, a.token, 201);
  assert.equal(request.status, "pending");
  await api("POST", "/requests", { receiverId: b.user._id, skillWanted: photoshop, skillOffered: python }, a.token, 400);
  await api("PATCH", `/requests/${request._id}/status`, { status: "accepted" }, a.token, 403);
  await api("PATCH", `/requests/${request._id}/status`, { status: "accepted" }, outsider.token, 403);
  await api("POST", "/reviews", { requestId: request._id, rating: 5 }, a.token, 400);
  await api("PATCH", `/requests/${request._id}/status`, { status: "accepted" }, b.token);
  const message = await api("POST", `/messages/${b.user._id}`, { text: "Ready for our lesson?" }, a.token, 201);
  const thread = await api("GET", `/messages/${a.user._id}`, undefined, b.token);
  assert.equal(thread.connected, true);
  assert.equal(thread.messages[0]._id, message._id);
  assert.equal((await Message.findById(message._id)).text, "Ready for our lesson?");
  const conversations = await api("GET", "/messages/conversations", undefined, b.token);
  assert.equal(conversations[0].user._id, a.user._id);
  await api("PATCH", `/requests/${request._id}/status`, { status: "completed" }, a.token);
  await api("POST", "/reviews", { requestId: request._id, rating: 5, comment: "Great session" }, a.token, 201);
  await api("POST", "/reviews", { requestId: request._id, rating: 4, comment: "Helpful tutor" }, b.token, 201);
  await api("POST", "/reviews", { requestId: request._id, rating: 5 }, a.token, 400);
  await api("POST", "/reviews", { requestId: request._id, rating: 5 }, outsider.token, 403);
  const reviews = await api("GET", "/reviews/me", undefined, b.token);
  assert.equal(reviews.count, 1);
  assert.equal(reviews.average, 5);
  const requests = await api("GET", "/requests", undefined, a.token);
  assert.equal(requests.sent[0].status, "completed");
  assert.equal(requests.sent[0].reviewedByMe, true);
  const profile = await api("GET", `/users/${b.user._id}`, undefined, a.token);
  assert.equal(profile.rating.average, 5);
  const second = await api("POST", "/requests", { receiverId: b.user._id, skillWanted: photoshop, skillOffered: python }, a.token, 201);
  await api("PATCH", `/requests/${second._id}/status`, { status: "rejected" }, b.token);
  await api("PATCH", `/requests/${second._id}/status`, { status: "completed" }, a.token, 400);
});
