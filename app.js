import express from 'express';
import routes from './src/routes.js'
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.json();
});

app.use('',routes)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
