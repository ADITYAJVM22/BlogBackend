import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema=new Schema(
    {
        title:{
            type:String,
            required:true
        },
        blog:{
            type:String,
            required:true
        },
        owner:{
            type:mongoose.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true}
)
blogSchema.plugin(mongooseAggregatePaginate)
export const Blog=mongoose.model("Blog",blogSchema)