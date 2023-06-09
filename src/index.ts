import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { IncomingMail } from "cloudmailin";
dotenv.config();

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => res.json({ ok: true }));

app.post("/incoming_mails/", (req: Request, res: Response) => {
  const mail = <IncomingMail>req.body;

  res.status(201).json(mail);
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port: ${process.env.PORT}`)
);
