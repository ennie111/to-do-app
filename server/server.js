const express = require('express'); // Importiert Express
const app = express();             // Erstellt eine App-Instanz

const PORT = 3000;                 // Port-Nummer

// Route für die Homepage
app.get('/', (req, res) => {
    res.send('Hello, Node.js Server!');
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const todos = []; // Temporäre Daten (später durch DB ersetzt)

app.use(express.json());

// GET: Alle To-Dos abrufen
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// POST: Neues To-Do hinzufügen
app.post('/api/todos', (req, res) => {
    const todo = req.body; // Annahme: JSON-Daten im Body
    todos.push(todo);
    res.status(201).json(todo);
});

// DELETE: Ein To-Do löschen
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const index = todos.findIndex(todo => todo.id === parseInt(id));
    if (index !== -1) {
        todos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'To-Do not found' });
    }
});
