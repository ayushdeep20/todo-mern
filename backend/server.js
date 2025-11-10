const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const Task = require('./models/task');

// connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Mongo connected'))
.catch(err => console.error('Mongo error:', err.message));

// routes
app.get('/api/health', (req, res) => res.json({ ok: true }));

// create task
app.post('/api/tasks', async (req, res) => {
  try {
    const t = new Task(req.body);
    await t.save();
    res.status(201).json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// get tasks (search optional)
app.get('/api/tasks', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ],
        }
      : {};
    const tasks = await Task.find(filter).sort({ dateTime: 1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const t = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// weekly summary (Mon–Sun)
app.get('/api/weekly-summary', async (req, res) => {
  try {
    const tasks = await Task.find({}).lean();
    const groups = {};
    tasks.forEach(task => {
      const d = new Date(task.dateTime);
      const day = (d.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(d);
      monday.setDate(d.getDate() - day);
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = { open: 0, completed: 0, tasks: [] };
      groups[key].tasks.push(task);
      if (task.status === 'completed') groups[key].completed++;
      else groups[key].open++;
    });
    res.json(groups);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));


