const express = require('express');
const app = express();
const port = 3000; // You can choose any port you like

app.get('/', (req, res) => {
  res.send('Hello from my Express server!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});