import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import fs from 'fs';
import { File } from 'formidable';
import twilio from 'twilio';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_SECRET_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendEmail = async (
  email: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BERVO_EMAIL,
        pass: process.env.BERVO_PASS,
      },
    });

    const mailOptions = {
      from: process.env.BERVO_EMAIL,
      to: email,
      subject: subject,
      text: html.replace(/<[^>]+>/g, ''),
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const uploadFile = async (file: File) => {
  const fileBuffer = fs.readFileSync(file.filepath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: file.newFilename,
    ContentDisposition: 'inline',
    ContentType: file.mimetype,
    Body: fileBuffer,
    ACL: 'public-read',
  };
  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    if (data.$metadata.httpStatusCode == 200) {
      //This is for creating Url of uploaded file
      const objectUrl_mannual = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${file.newFilename}`;
      return objectUrl_mannual;
    }
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const sendMessage = async (
  to: string,
  message: string
): Promise<boolean> => {
  try {
    const response = await twilioClient.messages
      .create({
        body: message,
        to: `+${to}`,
        from: process.env.TWILIO_FROM,
      })
      .then(async (message: any) => {
        return true;
      })
      .catch((error: any) => {
        console.log('error', error);
        return false;
      });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// //sendgrid function
// export const sendEmail = async (
//   email: string,
//   subject: string,
//   html: string
// ): Promise<boolean> => {
//   let transporter = nodemailer.createTransport({
//     host: 'smtp.sendgrid.net',
//     port: 465,
//     auth: {
//       user: 'apikey',
//       pass: process.env.SENDGRID_API_KEY,
//     },
//   });
//   let mailOptions = {
//     from: 'no-reply@pulsepilot.ai',
//     to: email,
//     subject: subject,
//     html: html,
//     fromName: 'PulsePilotAI',
//   };
//   const response = await transporter
//     .sendMail(mailOptions)
//     .then((data: any) => {
//       console.log('data ', data);
//       return true;
//     })
//     .catch((err: any) => {
//       console.log('err ', err);
//       return false;
//     });
//   return response;
// };

//******** Goole Auth Email sending code working **************/
//******** Need Google Console Account and Gmail Api enable  */

// const oauth2Client = new OAuth2Client(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET
// );

// oauth2Client.setCredentials({
//   // refresh_token: process.env.REFRESH_TOKEN,
//   refresh_token:
//     '1//04u6231XpDaqACgYIARAAGAQSNwF-L9IrN354b7Av64nHVHPPCGDyPgREDuy9K7M5YuGYZFE7mcsURTp0Ub8pjzGQzukPjmj2ZB8',
// });

// const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// export const sendEmail = async (
//   email: string,
//   subject: string,
//   html: string
// ): Promise<boolean> => {
//   try {
//     const raw = createEmailBody(process.env.FROM_EMAIL, email, subject, html);
//     const response = await gmail.users.messages.send({
//       userId: 'me',
//       requestBody: {
//         raw: raw,
//       },
//     });

//     console.log('Email sent:', response.data);
//     return true;
//   } catch (error) {
//     console.error('Failed to send email:', error);
//     console.error('Access token expired or invalid. Refreshing token...');
//     try {
//       const { tokens } = await oauth2Client.refreshAccessToken();
//       console.log('tokens: ', tokens);
//       oauth2Client.setCredentials(tokens);
//       console.log('Access token refreshed successfully:', tokens.access_token);
//       // Retry the email sending process
//       // You can implement retry logic here if needed
//       return await sendEmail(email, subject, html);
//     } catch (refreshError) {
//       console.error('Error refreshing access token:', refreshError);
//       // Handle refresh token error gracefully
//     }
//     // Check if the error is due to an invalid token
//     if (error.code === 401 && error.errors[0].reason === 'invalidCredentials') {
//       console.error('Access token expired or invalid. Refreshing token...');
//       try {
//         const { tokens } = await oauth2Client.refreshAccessToken();
//         console.log('tokens: ', tokens);
//         oauth2Client.setCredentials(tokens);
//         console.log(
//           'Access token refreshed successfully:',
//           tokens.access_token
//         );
//         // Retry the email sending process
//         // You can implement retry logic here if needed
//         return await sendEmail(email, subject, html);
//       } catch (refreshError) {
//         console.error('Error refreshing access token:', refreshError);
//         // Handle refresh token error gracefully
//       }
//     }
//     return false;
//   }
// };

// function createEmailBody(
//   from: string,
//   to: string,
//   subject: string,
//   messageHtml: string
// ): string {
//   const messageParts = [
//     `From: <${from}>`,
//     `To: <${to}>`,
//     `Subject: ${subject}`,
//     'Content-Type: text/html; charset=utf-8',
//     'MIME-Version: 1.0',
//     '',
//     messageHtml,
//   ];

//   const message = messageParts.join('\n');
//   const encodedMessage = Buffer.from(message)
//     .toString('base64')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');

//   return encodedMessage;
// }
