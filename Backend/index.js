import express from 'express';
import dotenv from 'dotenv';
import userauthroute from './routes/User/auth.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json()); // parse incoming JSON requests


app.use('/user', userauthroute);


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
