// require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const favicon = require('express-favicon');
const app = express();
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session')

// View engine setup
app.use(favicon(__dirname + '/public/favicon.png'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(bodyParser.urlencoded({ extender: false }));
app.use(bodyParser.json());


app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

app.get('/', (req, res) => {
    res.render('contact');
})


app.post('/send', (req, res) => {
    const output = `
    <p>You have a new contact request </p>
    <h3>Contact Details </h3>
    <ul>
        <li>Name: ${req.body.name} </li>
        <li>Email: ${req.body.email}  </li>
        <li>Company: ${req.body.company}  </li>
        <li>Newsletter: ${req.body.news} </li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PW
        },
        tls: {
            rejectUnauthorized: true
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Nodemailer contact" ${process.env.EMAIL}`, // sender address
        to: `${process.env.EMAIL_LIST}`, // list of receivers
        subject: 'Node contact request ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', { msg: 'Email has be sent' });
        res.redirect('http://google.com');
    });
});

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(process.env.PORT || 3000, () => console.log('Server Started...'));