const apis = require("../model/apisModel");
module.exports={
    getApis:async(req,res)=>{
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.json({responseCode:403,responseMessage:"Unauthorized"})
            }
            const title=req.body.title;
            const result=await apis.findOne({title:title});
            if (!result){
                return res.json({responseCode:404,responseMessage:"data not exist"})
            }
            return res.json({responseCode:200,responseMessage:"successfull",responseResult:result});
       
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
},
    update:async(req,res)=>{
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.json({responseCode:403,responseMessage:"Unauthorized"})
            }
            const title=req.body.title;
            const updatedContent=req.body.content
            const result=await apis.updateOne({title:title},{$set:{content:updatedContent}},{ new: true, upsert: false });
            if (!result){
                return res.json({responseCode:404,responseMessage:"Not updated"})
            }
            return res.json({responseCode:200,responseMessage:"successfull",responseResult:result});
       
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    }
}