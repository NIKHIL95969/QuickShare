import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Group name is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Group owner/creator
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    // Group members (array of user IDs)
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }
    }],
    // Pending invitations (for users not yet registered)
    pendingInvitations: [{
        email: {
            type: String,
            required: true
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        invitedAt: {
            type: Date,
            default: Date.now
        },
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    }],
    // Group settings
    settings: {
        isPrivate: {
            type: Boolean,
            default: true
        },
        allowMemberInvites: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

// Index for efficient queries
groupSchema.index({ ownerId: 1 });
groupSchema.index({ "members.userId": 1 });
groupSchema.index({ "pendingInvitations.email": 1 });

const Group = mongoose.models.groups || mongoose.model("groups", groupSchema);

export default Group;
