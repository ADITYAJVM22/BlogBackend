import multer from "multer";

const storage=multer.diskStorage({
    destination:function(req,res,cb){
        cb(null,"./public/temp") //will be stored here
    },
    filename:function(req,file,cb){
        cb(null,file.originalname) //file name will be original
    }
})

export const upload=multer({storage})