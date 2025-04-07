import fs from "fs";
import path from "path";

import { SendEmailCommand, SESClient } from"@aws-sdk/client-ses";
import { config } from"dotenv";

config();
console.log("process.env.CLIENT_URL", process.env.CLIENT_URL);
// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  },
});

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = [],
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses:
      replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses],
  });
};

const sendVerifyEmail = async (toAddress, subject, body) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject,
  });

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
};

// sendVerifyEmail(
//   "lientanvung2101@gmail.com",
//   "Tiêu đề email",
//   "<h1>Nội dung email</h1>"
// );

const verifyEmailTemplate = fs.readFileSync(
  path.resolve("template/verify-email.html"),
  "utf-8"
);

export const sendForgotPasswordEmail = (
  toAddress,
  forgot_password_token,
  template = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    "Forgot Password",
    template
      .replace(
        "{{title}}",
        "You are receiving this email because you requested to reset your password"
      )
      .replace("{{content}}", "Click the button below to reset your email")
      .replace("{{titleLink}}", "Reset Password")
      .replace(
        "{{link}}",
        `${process.env.CLIENT_URL}/reset-password?token=${forgot_password_token}`
      )
  );
};
