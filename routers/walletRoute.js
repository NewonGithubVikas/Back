const walletRoute=require('express').Router();
const walletController=require('../controller/walletcontroller');

walletRoute.post('/balance',walletController.balance);
walletRoute.post('/addbalance',walletController.add);

walletRoute.post('/withdraw-balance',walletController.withdrawBalance);

walletRoute.post('/credit-history',walletController.creditHistory);
walletRoute.post('/withdraw-history',walletController.withdrawHistory);

// Admin wallet related functionality will maintain in the below given route and controller
walletRoute.get('/total-credit-history',walletController.totalCreditHistory);
walletRoute.get('/total-withdraw-history',walletController.totalWithdrawHistory);

module.exports=walletRoute;