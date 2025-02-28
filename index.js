const express=require('express')
const cors = require('cors');
const app=express()

const userRoute = require("./routers/userRoute");
const adminRoute=require("./routers/subAdminRoute")
const bodyParser = require("body-parser");
const apisRoute = require("./routers/apisRoute");
const walletRoute = require("./routers/walletRoute");
const gameRoute = require("./routers/gameRoute");
const accountRouter = require('./routers/accountRoute');
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cors()); 
require('dotenv').config();
const Port= process.env.PORT||3000;

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.get("/", (req, res) => {
    res.send(`<div style="text-align:center;padding-top:40px;">
    <h1>Hello world!</h1>
</div> `);
});

app.use('/account',accountRouter);
app.use('/user',userRoute);
app.use('/admin',adminRoute);
app.use('/apis',apisRoute);
app.use('/wallet',walletRoute);
app.use('/game',gameRoute);
app.listen(Port, () => {
  console.log(`server created successfully, running at port ${Port}`);
})