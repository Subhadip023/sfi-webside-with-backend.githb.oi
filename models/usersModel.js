import { Schema,model } from "mongoose";
const Usershema =new Schema({
    name :{type:String,required:true},
    password :{type:String ,required:true},
    email:{type:String ,required:true},
    phoneno :{type:String,require:true},
    avatar :{type:String},
    position:{type:String, default:"member"}
})

export default model("User",Usershema); 