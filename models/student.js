import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    contestId: Number,
    name: String,
    date: Date,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    delta: Number,
    unsolvedCount: Number
});

const submissionSchema = new mongoose.Schema({
    problemId: String, // contestId + index (e.g., "1700A")
    rating: Number,
    tags: [String],
    time: Date,
    verdict: String
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    cfHandle: String,
    currentRating: Number,
    maxRating: Number,
    lastSyncedAt: { type: Date, default: Date.now }, 
    cfDataLastUpdated: Date,

    cfContests: [contestSchema],
    cfSubmissions: [submissionSchema],

    inactivityReminderCount: { type: Number, default: 0 },
    emailReminderDisabled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
