const express = require('express');
const daily = require('./api/daily');
const reminder = require('./api/reminder');

const app = express();
app.use(express.json());

app.post('/api/daily', async (req, res) => daily(req, res));
app.post('/api/reminder', async (req, res) => reminder(req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
