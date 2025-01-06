const express = require('express'); // Express importieren
const mongoose = require('mongoose'); // Mongoose importieren
const bodyParser = require('body-parser'); // Für das Parsen von JSON-Anfragen
const Joi = require('joi'); // Für Datenvalidierung
require('dotenv').config(); // Falls du später Umgebungsvariablen verwenden möchtest

const app = express(); // Express-Anwendung erstellen
const PORT = 3000; // Port definieren

// Middleware
app.use(bodyParser.json()); // JSON-Daten parsen

// Verbindung zur lokalen MongoDB-Datenbank
mongoose
  .connect('mongodb://localhost:27017/toDoApp')
  .then(() => console.log('✅ Verbunden mit der MongoDB-Datenbank'))
  .catch((err) => console.error('❌ Fehler beim Verbinden zur MongoDB:', err));

// Definiere ein Schema für To-Dos
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  completed: { type: Boolean, default: false },
});

// Erstelle ein Modell für die Sammlung "todos"
const Todo = mongoose.model('Todo', todoSchema);

// Validierungsschema für To-Do-Daten mit Joi
const todoValidationSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().optional(),
  completed: Joi.boolean().optional(),
});

// Routen

// 1. Alle To-Dos abrufen (mit Pagination)
app.get('/api/todos', async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Standardwerte für Pagination
  try {
    const todos = await Todo.find()
      .limit(limit * 1) // Anzahl der Ergebnisse begrenzen
      .skip((page - 1) * limit) // Ergebnisse überspringen
      .exec();
    const count = await Todo.countDocuments(); // Gesamtanzahl der Dokumente
    res.json({
      todos,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Fehler beim Abrufen der To-Dos', error: err });
  }
});

// 2. Ein neues To-Do erstellen (mit Validierung)
app.post('/api/todos', async (req, res) => {
  // Datenvalidierung
  const { error } = todoValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Ungültige Daten', details: error.details });
  }

  try {
    const newTodo = new Todo(req.body); // Neues To-Do aus den Request-Daten erstellen
    await newTodo.save(); // In der Datenbank speichern
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: 'Fehler beim Erstellen eines To-Dos', error: err });
  }
});

// 3. Ein To-Do aktualisieren (mit Validierung)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params; // ID aus der URL abrufen

  // Datenvalidierung
  const { error } = todoValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Ungültige Daten', details: error.details });
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(id, req.body, { new: true }); // To-Do aktualisieren
    if (!updatedTodo) {
      return res.status(404).json({ message: 'To-Do nicht gefunden' });
    }
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren des To-Dos', error: err });
  }
});

// 4. Ein To-Do löschen
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params; // ID aus der URL abrufen
  try {
    const deletedTodo = await Todo.findByIdAndDelete(id); // To-Do löschen
    if (!deletedTodo) {
      return res.status(404).json({ message: 'To-Do nicht gefunden' });
    }
    res.status(204).send(); // Keine Inhalte zurückgeben
  } catch (err) {
    res.status(400).json({ message: 'Fehler beim Löschen des To-Dos', error: err });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
