import express from 'express';
import studentController from '../controllers/studentController.js';

const router = express.Router();
// Route to get all students
router.get('/', studentController.getAllStudents);
// Route to create a new student
router.post('/', studentController.createStudent);
// Route to get a student by ID
router.get('/:id', studentController.getStudentById);
// Route to update a student by ID
router.put('/:id', studentController.updateStudent);
// Route to delete a student by ID
router.delete('/:id', studentController.deleteStudent);
// Route to sync student data with Codeforces
router.post('/:id/sync-now', studentController.syncStudentNow);

// Route to enable email reminders for a student
router.post('/:id/toggle-reminder', studentController.toggleEmailReminder);
// Route to get reminder stats for a student
router.get('/:id/reminder-stats', studentController.getReminderStats);

// Route to download student data as CSV
router.get('/download/csv', studentController.downloadCSV);

// Route to get student profile data
router.get('/:id/profile', studentController.getStudentProfile);

// Route to run daily sync
router.post('/run-daily-sync', studentController.runDailySyncController);



export default router;