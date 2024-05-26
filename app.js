const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Admin = require('./model/admins');
const Calendar=require('./model/admins');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const path = require('path');
dotenv.config({ path: './config.env' });
require('./db/conn');
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const imagePath = 'uploads/2023-12-23T05-50-33.843Zimage (2).png';
const resolvedPath = path.resolve(imagePath);
console.log(resolvedPath);

app.use('/uploads', express.static('uploads'));
const corsOptions = {
    origin: [`${process.env.FRONTEND_URL}`,`${process.env.FRONTEND_URL1}`],
    credentials: true,
};
app.use(cors(corsOptions));

// ROUTES
app.use(require('./router/adminauth'));
app.use('/api/clients', require('./router/clientauth'));

// const CLIENT_ID = '1035114720658-os83srdr4ffqp750h7as3u4oporb06js.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04UI8JcvsKQ5sCgYIARAAGAQSNwF-L9IrVdiJi0s6ZwnF_vCSYVTN1SFdSfXIDrz_udHgmvRcLw1LDWUBm46TKHSwT46ZE1_dsy0';



const CLIENT_ID=0 ;
const CLIENT_SECRET=0 ;
const REDIRECT_URI=0;
const REFRESH_TOKEN=0;
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });



// Add events or remove them
// import { Calendar } from './model/admins';

// Get user's emails
app.get('/emails', async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const response = await gmail.users.messages.list({
            userId: 'me',
        });

        const messages = response.data.messages;

        // Fetch detailed information for each message
        const emails = await Promise.all(
            messages.map(async (message) => {
                const messageDetails = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                });

                // Extract relevant information from the message details
                const { from, subject, snippet,timestamp } = extractEmailInformation(messageDetails.data);

                return {
                    id: message.id,
                    threadId: message.threadId,
                    from,
                    subject,
                    snippet,
                    timestamp
                };
            })
        );

        console.log(emails);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/sent-emails', async (req, res) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Fetch sent emails (sent label)
        const sentResponse = await gmail.users.messages.list({
            userId: 'me',
            labelIds: 'SENT', // Use the label for sent emails
        });

        const sentMessages = sentResponse.data.messages;

        // Fetch detailed information for each sent message
        const sentEmails = await Promise.all(
            sentMessages.map(async (message) => {
                const messageDetails = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                });

                // Extract relevant information from the message details
                const { from, subject, snippet, timestamp } = extractEmailInformation(messageDetails.data);

                return {
                    id: message.id,
                    threadId: message.threadId,
                    from,
                    subject,
                    snippet,
                    timestamp,
                };
            })
        );

        console.log('Sent Emails:', sentEmails);
        res.json(sentEmails);
    } catch (error) {
        console.error('Error fetching sent emails:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/emails/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id,
      });

      // Extract relevant information from the message details
      const { from, subject, snippet,timestamp } = extractEmailInformation(messageDetails.data);

      const emailDetails = {
          id: messageDetails.data.id,
          threadId: messageDetails.data.threadId,
          from,
          subject,
          snippet,
          timestamp,
          body: messageDetails.data.snippet,
      };

      console.log(emailDetails);
      res.json(emailDetails);
  } catch (error) {
      console.error('Error fetching email by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to extract relevant information from a message
function extractEmailInformation(message) {
  const headers = message.payload.headers.reduce((acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
  }, {});

  const from = headers['from'] || 'Unknown';
  const subject = headers['subject'] || 'No Subject';
  const snippet = message.snippet || 'No Snippet';
  const timestamp = message.internalDate ? new Date(parseInt(message.internalDate)).toDateString() : 'No Timestamp';

  return { from, subject, snippet, timestamp };
}



app.post('/sendemail', async (req, res) => {
  const {message, useremail } = req.body;

  if (!message|| !useremail) {
      return res.json({ message: 'Please fill all fields' });
  }

  try {
      // Ensure oAuth2Client is properly configured
      const accessToken = await oauth2Client.getAccessToken();

      // Fix the 'auth' object in transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'faizanazam6980@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken, // This is optional, as nodemailer will fetch it automatically
        },
    });
    
      const mailOptions = {
          from: '"Gym App" <faizanazam6980@gmail.com>',
          to: useremail,
          subject: `Gym App sends you this message`,
          text: message,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Email sent!' });
  } catch (error) {
      console.error('Failed to send the email:', error);
      res.status(500).json({ error: 'Failed to send the email.' });
  }
});




const port = process.env.PORT;

app.listen(port, () => console.log(`Server running on port ${port} 🔥`));
