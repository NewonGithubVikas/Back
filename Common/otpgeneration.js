//otp generation code are written here.............................................................
module.exports = {
  otpgeneration: () => {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString(); // Convert to string
  },
};

//otp generation code end here.......................................
