const nodeMailer = require("nodemailer");
const { mailSource } = require("../helpers");
const Email = require("email-templates");
const path = require("node:path");
// import mailgunTransport from "nodemailer-mailgun-transport";

// const mailGunOptions = {
//   auth: {
//     api_key: process.env.MAILGUN_API_KEY!,
//     domain: process.env.MAILGUN_DOMAIN!,
//   },
// };
// const transporter = nodeMailer.createTransport(
//   mailgunTransport(mailGunOptions)
// );

const transporter = nodeMailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "promise.i@credpal.com",
    pass: process.env.BREVO_API_KEY,
  },
});
const email = new Email({
  views: {
    root: path.join(__dirname, "templates"),
    options: { extension: "ejs" },
  },
  message: {
    from: `${mailSource}`,
  },
  transport: transporter,
  send: true,
  // preview: true,
  // preview: {
  //   open: {
  //     app: "firefox",
  //     wait: false,
  //   },
  // },
  // preview: false,
});

class Mailer {
  static sendWelcomeMail({ recipient, firstName }) {
    email
      .send({
        template: path.join(__dirname, "templates", "welcome"),
        message: { to: recipient },
        locals: {
          recipient: recipient,
          firstName,
          base_url: process.env.FRONTEND_BASE_URL,
        },
      })
      .then((res) => console.log("welcome email", res))
      .catch((res) => console.log("welcome email", res));
  }

  static sendEmailVerificationMail({ recipient, firstName, link }) {
    email
      .send({
        template: path.join(__dirname, "templates", "verify-email"),
        message: { to: recipient },
        locals: {
          recipient: recipient,
          frontendUrl: process.env.FRONTEND_URL,
          firstName,
          link,
        },
      })
      .then((res) => console.log("email verification email", res))
      .catch((res) => console.log("email verification email", res));
  }

  static sendResetPasswordMail({ recipient, firstName, link }) {
    email
      .send({
        template: path.join(__dirname, "templates", "change-password"),
        message: { to: recipient },
        locals: {
          recipient: recipient,
          frontendUrl: process.env.FRONTEND_URL,
          firstName,
          link,
        },
      })
      .then((res) => console.log("reset password email", res))
      .catch((res) => console.log("reset password email", res));
  }

  static sendTransactionMail({
    recipients,
    productName,
    message,
    title,
    from,
    businessName,
  }) {
    for (const recipient of recipients) {
      email
        .send({
          template: path.join(__dirname, "templates", "campaign"),
          message: { to: recipient, from },
          locals: {
            recipient: recipient,
            productName,
            title,
            message,
            businessName,
          },
        })
        .then((res) => console.log("verify business email", res))
        .catch((res) => console.log("verify business email", res));
    }
  }
}

module.exports = Mailer;
