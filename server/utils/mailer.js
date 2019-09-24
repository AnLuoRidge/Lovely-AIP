const _ = require('lodash');
const nodemailer = require('nodemailer');
const { email, emailPwd, emailServiceProvider } = require('../config/keys');

const config = {
  // or Gmail, for more Well-known services
  // please visit https://nodemailer.com/smtp/well-known/
  service: emailServiceProvider,
  auth: {
    user: email,
    pass: emailPwd,
  },
};

const transporter = nodemailer.createTransport(config);

const defaultMail = {
  from: `Knight Frank <${email}>`,
  subject: 'Hello',
  html: '<b>Hello world?</b>', // html body
};

module.exports = (mail) => {
  // default setting
  mail = _.merge({}, defaultMail, mail);
  // send email
  transporter.sendMail(mail);
};
