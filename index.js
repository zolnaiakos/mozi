import express from 'express'
import filmek from './routes/filmek.js'
import vetitesek from './routes/vetitesek.js'
import statisztika from './routes/statisztika.js'
import foglalasok from './routes/foglalasok.js'


const app = express();
const port = 3000;

app.use(express.json());

app.use('/filmek', filmek)
app.use('/vetitesek', vetitesek)
app.use('/statisztika', statisztika)
app.use('/foglalasok', foglalasok)

app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`);
})