import { Schema,model } from "mongoose";
const donateshema =new Schema({
    amount:{type:String,require:true},
    isDone:{type:String,default:"Not done"},
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }  

},
{ timestamps: true })

export default model("Donate",donateshema); 