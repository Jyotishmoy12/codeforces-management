import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

export const sendInactivityEmail = async(to, name)=>{
    const mailOptions={
        from:`"Student Progress" <${process.env.EMAIL_USER}>`,
        to,
        subject:'Time to get back to coding!',
        text:`Hi ${name},\n\nWe noticed you haven't been active on the platform for a while. We miss you! It's time to get back to coding and improve your skills.\n\nBest regards,\nStudent Progress Team`
    };

    try{
        await transporter.sendMail(mailOptions);
        console.log(`Inactivity email sent to ${name}`);
        return true;
    }
    catch(error){
        console.error(`Error sending inactivity email to ${name}:`, error);
        return false;
    }
}