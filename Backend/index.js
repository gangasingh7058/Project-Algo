import express from 'express';
import dotenv from 'dotenv';
import userauthroute from './routes/User/auth.js';
import problemsroute from './routes/Problems/problem.js';
import userProfileroute from './routes/User/profile.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json()); // parse incoming JSON requests


app.get('/',(req,res)=>{
  res.send("<h1>Hello From Server</h1>")
})
app.use('/new/user', userauthroute);
app.use('/user',userProfileroute)
app.use('/api',problemsroute)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
