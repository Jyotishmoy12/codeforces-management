import express from 'express';
import studentController from '../controllers/studentController.js';

const router = express.Router();


// router to run daily sync
router.post('/run-daily-sync', studentController.runDailySyncController);

// router to download csv
router.get('/download/csv', studentController.downloadCSV);

// router to sync now
router.post('/:id/sync-now', studentController.syncStudentNow);

// router to toggle reminder
router.post('/:id/toggle-reminder', studentController.toggleEmailReminder);

// router to get reminder stats
router.get('/:id/reminder-stats', studentController.getReminderStats);

// router to get student profile
router.get('/:id/profile', studentController.getStudentProfile);

// router to get student by id
router.get('/:id', studentController.getStudentById);

// router to update student
router.put('/:id', studentController.updateStudent);

// router to delete student
router.delete('/:id', studentController.deleteStudent);

// router to get all students
router.get('/', studentController.getAllStudents);

// router to create student
router.post('/', studentController.createStudent);

export default router;
