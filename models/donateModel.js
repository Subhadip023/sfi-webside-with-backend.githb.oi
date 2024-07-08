import { Schema,model } from "mongoose";
const donateshema =new Schema({
    name :{type:String,required:true},
    email:{type:String ,required:true},
    phone :{type:String,require:true},
    amount:{type:String,require:true},
    isDone:{type:Boolean,default:false}
})

export default model("Donate",donateshema); 