import express from "express"
import cors from 'cors'
import dotenv from 'dotenv';

import getfilepath from './Help_Functions/getfilepath.js'
import runcode from "./Help_Functions/runcode.js";


dotenv.config();


const app=express();
const port=process.env.PORT || 3003;

app.use(cors());
app.use(express.json());



app.get('/',(req,res)=>{
    res.send('<H1>HELLO FROM COMPILER</H1>')
})

app.post('/run', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.json({
            success: false,
            msg: "Send Both Language and Code",
        });
    }

    try {
        const filepath = getfilepath(language, code); // save file get file path
        const verdict = await runcode(filepath);      // compiles and gives verdict

        return res.json({
            success: true,
            verdict: verdict.output.replace(/\r\n/g, ' ') || "No Output",
            err:verdict.err || "No error" 
        });
    } catch (err) {
        return res.json({
            success: false,
            error: err.error || "Unknown error",
        });
    }
});

app.listen(port,()=>{
    console.log(`Listening in port => ${port}`);
    
})