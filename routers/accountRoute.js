const accountRouter = require('express').Router();
const accountController = require('../controller/accountcontroller');
accountRouter.post('/account-details',accountController.accountDetails);
accountRouter.post('/add-account',accountController.addAccount);
accountRouter.put("/update/:accountId",  accountController.editAccount);  // ✅ Pass accountId in URL
accountRouter.delete("/delete/:accountId", accountController.deleteAccount);
//admin can see the user account details.................
accountRouter.post('/account-admin',accountController.accountDetails);
module.exports = accountRouter;