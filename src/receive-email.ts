import { inspect } from "util";
import dotenv from "dotenv";
import Imap from "node-imap";
import quotedPrintable from "quoted-printable";
dotenv.config();

const config = {
  user: process.env.MAIL_USER!,
  password: process.env.MAIL_PASSORD!,
  host: process.env.HOST_MAIL!,
  port: 993,
  tls: true,
  keepalive: {
    interval: 30000, // cada 30 segundos enviara un comando NOOP al servidor(active session).
    idleInterval: 300000, // conexion en espera de 5 min, hasta que ocurran cambios.
    forceNoop: false, // si utilizara el comando IDLE si el servidor lo admite.
  },
};

const conn = new Imap(config);

type funcCallback = (error: Error, mailbox: Imap.Box) => void;

const callback: funcCallback = (error: Error, mailbox: Imap.Box): void => {
  if (error)
    throw new Error(`Error al abrir la bandeja de entrada: ${error.message}`);

  console.log("Bandeja de entrada abierta");
  console.log(`Cantidad de correos electronicos: ${mailbox.messages.total}`);
  console.log(mailbox);

  // see content message.
  const f = conn.seq.fetch(mailbox.messages.total, {
    bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
    struct: true,
  });

  // data message fetching.
  f.on("message", (message, seqno) => {
    const prefix = "(#" + seqno + ") ";

    // read body.
    message.on("body", (stream, info) => {
      const { which } = info;

      // Read body of the message
      if (which == "TEXT") {
        let buffer = "";
        stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));

        message.once("end", () =>
          console.log(
            `${prefix}body message: ${quotedPrintable.decode(buffer)}`
          )
        );
      }

      // read headers of the message.
      if (which != "TEXT") {
        let buffer = "";
        stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));

        stream.once("end", () =>
          console.log(
            `${prefix}Parsed header: %s`,
            inspect(Imap.parseHeader(buffer))
          )
        );
      }
    });

    // read attributes.
    message.once("attributes", (attrs) =>
      console.log(`${prefix}Attributes: ${attrs["flags"]}`)
    );

    // end message.
    message.once("end", () => console.log(prefix + "Finished"));
  });

  // fetching message error.
  f.once("error", (err) => console.log("Fetch error: " + err));

  f.once("end", () => {
    console.log("Done fetching all messages!");
    // conn.end();
  });
};

const openInbox = (fn: funcCallback) => conn.openBox("INBOX", true, fn);

// events
conn.once("error", (error: Error) =>
  console.log("Error en la conexión IMAP:", error.message)
);

conn.on("end", () => console.log("La conexión IMAP se ha cerrado"));

conn.once("ready", () => openInbox(callback));

// Manejar eventos de nuevos mensajes
conn.on("mail", () => {
  console.log("¡Se recibio un nuevo mensaje!");

  // Volver a consultar la bandeja de entrada para obtener la información actualizada
  openInbox(callback);
});

conn.connect();
