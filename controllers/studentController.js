import Student from "../models/student.js";
import { syncStudentData } from "../services/codeforcesService.js";
import { Parser } from 'json2csv';
import dayjs from 'dayjs';
import {sendInactivityEmail} from "../services/emailService.js";
import rundailySync from "../cron/syncStudents.js";
// Function to get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        console.log("Fetched all students successfully:", students);
        res.status(200).json(students);
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({ message: "Error fetching students", error: err.message });
    }
}

// create student
export const createStudent = async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const savedStudent = await newStudent.save();
        console.log("Student created successfully:", savedStudent);
        res.status(201).json(savedStudent);
    } catch (err) {
        console.error("Error creating student:", err);
        res.status(500).json({ message: "Error creating student", error: err.message });
    }
}

// update student

export const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) {
            console.error("Student not found with ID:", req.params.id);
            return res.status(404).json({ message: "Student not found" });
        }
        console.log("Student updated successfully:", updatedStudent);
        res.status(200).json(updatedStudent);
    } catch (err) {
        console.error("Error updating student:", err);
        res.status(500).json({ message: "Error updating student", error: err.message });
    }
}

// delete student
export const deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            console.error("Student not found with ID:", req.params.id);
            return res.status(404).json({ message: "Student not found" });
        }
        console.log("Student deleted successfully:", deletedStudent);
        res.status(200).json(deletedStudent);
    } catch (err) {
        console.error("Error deleting student:", err);
        res.status(500).json({ message: "Error deleting student", error: err.message });
    }
}

// get student by id
export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            console.error("Student not found with ID:", req.params.id);
            return res.status(404).json({ message: "Student not found" });
        }
        console.log("Fetched student successfully:", student);
        res.status(200).json(student);
    } catch (err) {
        console.error("Error fetching student:", err);
        res.status(500).json({ message: "Error fetching student", error: err.message });
    }
}

export const syncStudentNow = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            console.error("Student not found with ID:", req.params.id);
            return res.status(404).json({ message: "Student not found" });
        }
        const data = await syncStudentData(student);
        console.log("Synced student data successfully:", data);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error syncing student data:", err);
        res.status(500).json({ message: "Error syncing student data", error: err.message });
    }
}

export const toggleEmailReminder = async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        console.error("Student not found with ID:", req.params.id);
        return res.status(404).json({ message: "Student not found" });
    }

    student.emailReminderDisabled = !student.emailReminderDisabled;
    await student.save();

    if (!student.emailReminderDisabled) {
        // Email reminder was just enabled — send inactivity email now
        const sent = await sendInactivityEmail(student.email, student.name);
        if (!sent) {
            return res.status(500).json({ message: "Failed to send inactivity email" });
        }
    }

    res.status(200).json({
        message: "Email reminder toggled",
        enabled: !student.emailReminderDisabled
    });
};


// get reminder status
export const getReminderStats = async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        console.error("Student not found with ID:", req.params.id);
        return res.status(404).json({ message: "Student not found" });
    }
    console.log("Fetched reminder stats for student:", student);
    res.status(200).json({
        emailRemindersEnabled: student.emailRemindersEnabled,
        emailReminderSent: student.emailReminderSent
    });
}

export const downloadCSV = async (req, res) => {
    try {
        const fields = [
            'name',
            'email',
            'phone',
            'cfHandle',
            'currentRating',
            'maxRating',
            'lastSyncedAt',
            'emailRemindersSent',
            'emailRemindersEnabled'
        ];

        // ✅ Fetch student data from DB
        const students = await Student.find().lean();

        // ✅ Convert to CSV
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(students);

        // ✅ Send CSV
        res.header('Content-Type', 'text/csv');
        res.attachment('students.csv');
        res.send(csv);
    } catch (err) {
        console.error("Error downloading CSV:", err);
        res.status(500).json({ message: "Error downloading CSV", error: err.message });
    }
};


export const getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const days = parseInt(req.query.days || '90');
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const fromDate = dayjs().subtract(days, 'day').toDate();

        // Filter contests
        const contests = student.cfContests
            .filter(c => new Date(c.date) >= fromDate)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Filter AC submissions only
        const solvedSubmissions = student.cfSubmissions
            .filter(s => s.verdict === 'OK' && new Date(s.time) >= fromDate);

        const uniqueSolvedProblems = new Map();
        for (const s of solvedSubmissions) {
            if (!uniqueSolvedProblems.has(s.problemId)) {
                uniqueSolvedProblems.set(s.problemId, s);
            }
        }

        const problems = Array.from(uniqueSolvedProblems.values());

        // Metrics
        const totalSolved = problems.length;
        const hardest = problems.reduce((a, b) => (!a || b.rating > a.rating ? b : a), null);
        const avgRating =
            totalSolved > 0 ? Math.round(problems.reduce((sum, p) => sum + (p.rating || 0), 0) / totalSolved) : 0;
        const avgPerDay = Math.round(totalSolved / days * 100) / 100;

        // Rating histogram
        const ratingBuckets = {};
        problems.forEach(p => {
            const bucket = Math.floor(p.rating / 100) * 100;
            ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
        });

        // Heatmap data
        const heatmap = {};
        problems.forEach(p => {
            const date = dayjs(p.time).format('YYYY-MM-DD');
            heatmap[date] = (heatmap[date] || 0) + 1;
        });

        res.json({
            contests,
            totalSolved,
            hardestProblem: hardest?.problemId || null,
            avgRating,
            avgPerDay,
            ratingBuckets,
            heatmap
        });
    } catch (err) {
        console.error('Error fetching student profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const runDailySyncController = async(req, res)=>{
    try{
        await rundailySync();
        res.status(200).json({message:"Daily sync completed"});
    }catch(err){
        console.error("Error running daily sync:", err);
        res.status(500).json({ message: "Error running daily sync", error: err.message });
    }
}

export default {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    syncStudentNow,
    toggleEmailReminder,
    getReminderStats,
    downloadCSV,
    getStudentProfile,
    runDailySyncController
};
