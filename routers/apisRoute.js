const apisRoute=require('express').Router();
const verifyToken = require('../middleware/userAuth');
const apiscontroller = require('../controller/apiscontroller');

apisRoute.get('/getApis',verifyToken.verifyToken,apiscontroller.getApis);
apisRoute.post('/update',verifyToken.verifyToken,apiscontroller.update)

module.exports=apisRoute;