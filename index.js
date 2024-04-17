require('dotenv').config();
const URL = process.env.API_URL || "127.0.0.1" // Finns i .env men du får inte med den så lägger till det här med.
const PORT = process.env.PORT || "3000" // Finns i .env men du får inte med den så lägger till det här med.
const express = require("express");
const app = express();
const beanRoutes = require('./routes/beanRoutes')
const userRoutes = require('./routes/userRoutes')

app.use(express.json());

app.use('/api/beans', beanRoutes);
app.use('/api/user', userRoutes);

const server = app.listen(PORT, URL, () => {
  console.log(`listening to port ${PORT} and running at http://${URL}:${PORT} or http://localhost:${PORT}`);
});

