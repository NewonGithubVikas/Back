const walletRoute=require('express').Router();
const walletController=require('../controller/walletcontroller');
const userAuth = require('../middleware/userAuth');
walletRoute.post('/balance', userAuth.verifyToken,walletController.balance);
walletRoute.post('/addbalance', userAuth.verifyToken,walletController.add);

walletRoute.post('/withdraw-balance', userAuth.verifyToken,walletController.withdrawBalance);

walletRoute.post('/credit-history', userAuth.verifyToken,walletController.creditHistory);
walletRoute.post('/withdraw-history', userAuth.verifyToken,walletController.withdrawHistory);

// Admin wallet related functionality will maintain in the below given route and controller
walletRoute.get('/total-credit-history', userAuth.verifyToken,walletController.totalCreditHistory);
walletRoute.get('/total-withdraw-history', userAuth.verifyToken,walletController.totalWithdrawHistory);

module.exports=walletRoute;