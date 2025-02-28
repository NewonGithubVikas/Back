const gameRoute=require('express').Router();
const gameController=require('../controller/gamecontroller');
gameRoute.get('/timer',gameController.timer);
//that game is currently running , there result will evalute after ending of the game......
gameRoute.get('/game',gameController.current);

gameRoute.post('/bet',gameController.bet);

gameRoute.get('/history',gameController.history);

module.exports=gameRoute;