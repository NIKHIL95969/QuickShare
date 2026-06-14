import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    temp: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String,
        required: false
    }
}, { timestamps: true })

const ContentPost = mongoose.models.contents || mongoose.model("contents", contentSchema);

export default ContentPost;