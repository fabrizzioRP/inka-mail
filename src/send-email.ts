import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Configurar el transporte de correo
let transporter = nodemailer.createTransport({
  host: process.env.HOST_MAIL!,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASSORD!,
  },
});

transporter.verify((err: Error | null, success: true) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("success connected: ", success);
  }
});

// Configurar los detalles del correo electrónico
let mailOptions = {
  from: process.env.USER,
  to: "fabrizziorp7@gmail.com",
  subject: "Logaritmo Testing",
  text: "This message is only for test :)",
};

// Enviar el correo electrónico
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error al enviar el correo:", error.message);
  } else {
    console.log(`Correo electrónico enviado: ${info.response}`);
    console.log(info);
  }
});
