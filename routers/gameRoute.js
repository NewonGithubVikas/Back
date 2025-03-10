const gameRoute=require('express').Router();
const gameController=require('../controller/gamecontroller');
const userAuth = require("../middleware/userAuth");
gameRoute.get('/timer',userAuth.verifyToken,gameController.timer);
//that game is currently running , there result will evalute after ending of the game......
gameRoute.get('/game',userAuth.verifyToken,gameController.current);

gameRoute.post('/bet',userAuth.verifyToken,gameController.bet);

gameRoute.get('/history',userAuth.verifyToken,gameController.history);

gameRoute.post("/number-bet",userAuth.verifyToken,gameController.Numberbet);

module.exports=gameRoute;