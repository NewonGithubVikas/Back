const express = require('express');
const userAuth=require('../middleware/userAuth')
const adminController = require('../controller/admincontroller');
const adminRoutes = express.Router();

// admin Auth routes

adminRoutes.post('/signin', adminController.login)

// admin functionality routes

adminRoutes.get('/allUsers', userAuth.verifyToken, adminController.getAllUser)

adminRoutes.put('/login/:id/status', userAuth.verifyToken, adminController.changeUserStatus)

adminRoutes.get('/users/:id', userAuth.verifyToken, adminController.getUserById)

adminRoutes.post('/create/user', userAuth.verifyToken, adminController.createUser)

adminRoutes.get('/getAdmin', userAuth.verifyToken, adminController.getAdmin)

// here user request (add,withdraw) api will manage by admin
adminRoutes.get('/check-add-request',userAuth.verifyToken,adminController.watchAddRequest);
adminRoutes.get('/check-withdraw-request',userAuth.verifyToken,adminController.watchWithdrawRequest);
adminRoutes.post('/status-withdraw-change',userAuth.verifyToken,adminController.changeWithdrawStatus);
adminRoutes.get('/dashboard-stats',userAuth.verifyToken,adminController.Dashboard);
//Admin wallet handller router written here as admin can add & withdraw money from the user account but
//  history will 
//not show
adminRoutes.post('/admin-addbalance',userAuth.verifyToken,adminController.add);

adminRoutes.post('/admin-withdraw-balance',userAuth.verifyToken,adminController.withdrawBalance);

module.exports=adminRoutes;
