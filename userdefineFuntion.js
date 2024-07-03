import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import sharp from 'sharp';

import env from'dotenv';
env.config()

export async function convert_to_hash_s10(password) {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds parameter
    return hashedPassword;
}

 function send_mail() {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'Gmail', // you can replace this with your email service
        auth: {
            user: 'gyaanhub8@gmail.com', // your email address
            pass: 'raat wrnu vxix pgff' // your email password
        }
    });

    // Define email content
    let mailOptions = {
        from: 'gyaanhub8@gmail.com', // sender address
        to: 'subhadip240420@gmail.com', // list of receivers
        subject: 'Test Email', // Subject line
        text: 'Hello, this is a test email.', // plain text body
        // You can also use html: '<h1>Hello, this is a test email.</h1>' for HTML content
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}


export let transporter = nodemailer.createTransport({
    service: 'Gmail', // you can replace this with your email service
    auth: {
        user: 'gyaanhub8@gmail.com', // your email address
        pass: process.env.EMAIL_APP_PASSWORD // your email password
    }
});

export function generateOTP(length) {
    const charset = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
    }

    return  otp;
}


export const compressImageToTargetSize = async (imageBuffer, targetSizeKb) => {
    const targetSizeBytes = targetSizeKb * 1024; // Convert KB to bytes
    let quality = 100; // Start with the highest quality
    let compressedImageBuffer;
    let fileSize;

    // Loop to reduce quality gradually until the target file size is reached
    while (quality > 0) {
        compressedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 500 }) // Resize image to a maximum width of 500 pixels
            .jpeg({ quality }) // Convert image to JPEG format with current quality setting
            .toBuffer();

        fileSize = compressedImageBuffer.length;

        // Check if the current file size is less than or equal to the target size
        if (fileSize <= targetSizeBytes) {
            break; // Stop if the target size is achieved
        }

        // Reduce quality and try again
        quality -= 5; // Decrease quality in steps of 5
    }

    // Return the compressed image buffer
    return compressedImageBuffer;
};




