const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Genius car server is running.');  // it will show on browser (http://localhost:5000/)
})

app.listen(port, () => {
    console.log(`Genius car server is running on port ${port}`)  // it will show on cmd
})