const express = require('express');
const middleWareToken=require('../middleware/userAuth')
const adminController = require('../controller/admincontroller');
const adminRoutes = express.Router();

// admin Auth routes

adminRoutes.post('/signin', adminController.login)

// admin functionality routes

adminRoutes.get('/allUsers', middleWareToken.verifyToken, adminController.getAllUser)

adminRoutes.put('/login/:id/status', middleWareToken.verifyToken, adminController.changeUserStatus)

adminRoutes.get('/users/:id', middleWareToken.verifyToken, adminController.getUserById)

adminRoutes.post('/create/user', middleWareToken.verifyToken, adminController.createUser)

adminRoutes.get('/getAdmin', middleWareToken.verifyToken, adminController.getAdmin)

// here user request (add,withdraw) api will manage by admin
adminRoutes.get('/check-add-request',adminController.watchAddRequest);
adminRoutes.get('/check-withdraw-request',adminController.watchWithdrawRequest);
adminRoutes.post('/status-withdraw-change',adminController.changeWithdrawStatus);
adminRoutes.get('/dashboard-stats',adminController.Dashboard);
//Admin wallet handller router written here as admin can add & withdraw money from the user account but
//  history will 
//not show
adminRoutes.post('/admin-addbalance',adminController.add);

adminRoutes.post('/admin-withdraw-balance',adminController.withdrawBalance);

module.exports=adminRoutes;
