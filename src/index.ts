import express, {Request, Response} from 'express';
import { createConnection } from 'typeorm';
createConnection().then(() =>{
    console.log('connected to the database')
})
const app = express();
const port = 7999;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello');
})


app.listen(port, () => {
    console.log(`listening to port ${port}`)
})