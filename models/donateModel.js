import { Schema,model } from "mongoose";
const donateshema =new Schema({
    amount:{type:String,require:true},
    isDone:{type:String,default:"Not Sure"}
})

export default model("Donate",donateshema); 