import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

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
        pass: 'raat wrnu vxix pgff' // your email password
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



