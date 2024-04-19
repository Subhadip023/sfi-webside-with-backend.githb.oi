import { Schema,model } from "mongoose";
const homeschema =new Schema({
    name :{type:String,required:true},
    content :{type:String ,required:true},
    image :{type:String },
   
})

export default model("Home",homeschema); 