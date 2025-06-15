import Student from '../models/student.js';
import {syncStudentData} from '../services/codeforcesService.js';
import { sendInactivityEmail } from '../services/emailService.js';

const rundailySync = async () => {
    console.log("🔁 Running Codeforces Data Sync + Inactivity Check...");

  const students = await Student.find();
  const now = Math.floor(Date.now() / 1000);
  const SEVEN_DAYS = 7 * 24 * 60 * 60;

  for (const student of students) {
    const { latestSubmissionTime } = await syncStudentData(student);

    const isInactive = now - latestSubmissionTime > SEVEN_DAYS;
    const shouldEmail = isInactive && student.emailRemindersEnabled;

    if (shouldEmail) {
      const sent = await sendInactivityEmail(student.email, student.name);
      if (sent) {
        student.emailReminderSent += 1;
        await student.save();
      }
    }
  }

  console.log("✅ Daily sync + email reminders done.");

}

export default rundailySync;