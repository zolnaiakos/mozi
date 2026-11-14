import express from 'express'
import filmek from './routes/filmek.js'
import vetitesek from './routes/vetitesek.js'


const app = express();
const port = 3000;

app.use('/filmek', filmek)
app.use('/vetitesek', vetitesek)

app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`);
})