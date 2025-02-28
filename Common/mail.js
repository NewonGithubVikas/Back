const nodemailer=require('nodemailer');

    async function domail (email,subject,msg)
    {
      try{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: "mobiloitte.node@gmail.com",
          pass: "wdbakhorlxmmqrhg",
        },
      });
      await transporter.sendMail({
        from: "mobiloitte.node@gmail.com",
        to: email, // list of receivers
        subject: subject, // Subject line
        text: msg,
      }).catch((er) => {
        console.log(er)
      });
    }
    catch (err) {
        console.log(err)
    }
    }
module.exports=domail;

