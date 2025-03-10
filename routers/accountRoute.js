const accountRouter = require('express').Router();
const accountController = require('../controller/accountcontroller');
const userAuth = require("../middleware/userAuth");
accountRouter.post('/account-details', userAuth.verifyToken,accountController.accountDetails);
accountRouter.post('/add-account', userAuth.verifyToken,accountController.addAccount);
accountRouter.put("/update/:accountId", userAuth.verifyToken,  accountController.editAccount);  // ✅ Pass accountId in URL
accountRouter.delete("/delete/:accountId", userAuth.verifyToken, accountController.deleteAccount);
//admin can see the user account details.................
accountRouter.post('/account-admin', userAuth.verifyToken,accountController.accountDetails);

module.exports = accountRouter;