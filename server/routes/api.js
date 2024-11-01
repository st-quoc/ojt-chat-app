// routes/api.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Promt = require('../models/Promt');

// Tạo session mới
router.post('/sessions', async (req, res) => {
  const { userId, sessionData } = req.body;
  try {
    const newSession = new Session({ userId, sessionData });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Lấy tất cả session của user
router.get('/sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const sessions = await Session.find({ userId });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Tạo promt mới trong session
router.post('/promts', async (req, res) => {
  const { sessionId, userId, question, answer } = req.body;
  try {
    const newPromt = new Promt({ sessionId, userId, question, answer });
    await newPromt.save();
    res.status(201).json(newPromt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create promt' });
  }
});

// Lấy tất cả promt của session
router.get('/promts/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const promts = await Promt.find({ sessionId });
    res.json(promts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promts' });
  }
});

// xóa session by id
router.delete('/delasessions', async (req, res) => {
  const { sessionId } = req.body;
  console.log(sessionId);
  try {
    await Session.deleteOne({ _id: sessionId });
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Xóa tất cả session của user
router.delete('/sessions', async (req, res) => {
  const { userId } = req.body;
  try {
    const sessionIds = await Session.find({ userId }).select('_id');
    console.log(sessionIds);
    await Session.deleteMany({ userId });
    await Promt.deleteMany({ sessionId: { $in: sessionIds } });

    res.status(200).json({ message: 'All sessions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sessions' });
  }
});

// Xóa 1 session
router.delete('/promts/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    await Promt.deleteMany({ sessionId });
    res.status(200).json({ message: 'All promts deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promts' });
  }
});

module.exports = router;
