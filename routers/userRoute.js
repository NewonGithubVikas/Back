const userRoute = require('express').Router();
const usercontroller = require('../controller/usercontroller');
const userAuth = require('../middleware/userAuth');
const upload=require('../middleware/upload');

userRoute.post('/signin', usercontroller.SignIn);
// userRoute.post('/signup', upload.single('file'),usercontroller.SignUp);
userRoute.post('/signup',usercontroller.SignUp);

userRoute.post('/otpvarify',usercontroller.otpVarify);
userRoute.post('/resendotp',usercontroller.resendOtp);

// userRoute.get('/profile', verifyToken.verifyToken, usercontroller.Profile);

// userRoute.delete('/deleteuser', usercontroller.deleteUser);
// userRoute.put('/updateuser', usercontroller.updateUser);

// userRoute.post('/forgetPassword',usercontroller.Forget);
userRoute.post('/updatePassword', userAuth.verifyToken,usercontroller.updatePassword);

// userRoute.post('/resetPassword',usercontroller.Reset);

// User can submit there request for add money and withdraw money from these api ,
// these api work with userRequestForMoney model
userRoute.post('/add-request', userAuth.verifyToken,usercontroller.addRequest);
userRoute.post('/withdraw-request', userAuth.verifyToken,usercontroller.withdrawRequest);

module.exports = userRoute;
