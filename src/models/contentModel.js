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
    // User ownership
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false // Allow anonymous posts
    },
    // Privacy settings
    isPrivate: {
        type: Boolean,
        default: false
    },
    isPasswordProtected: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: function() {
            return this.isPasswordProtected === true;
        }
    },
    // File support
    fileType: {
        type: String,
        enum: ["text", "image", "document", "code"],
        default: "text"
    },
    fileName: {
        type: String
    },
    fileSize: {
        type: Number
    },
    // Access control
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    // Metadata
    title: {
        type: String
    },
    description: {
        type: String
    },
    tags: [{
        type: String
    }]
}, { timestamps: true })

const ContentPost = mongoose.models.contents || mongoose.model("contents", contentSchema);

export default ContentPost;