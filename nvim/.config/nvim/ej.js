import express from "express";
import { v4 as uuidv4 } from "uuid";
import { connect } from "@turso/syncdatabase";

const server = express();
const PORT = process.env.PORT || 4000;

const db = await connect({
  path: process.env.TURSO_PATH,
  url: process.env.TURSO_URL,
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.listen(PORT, () => {
  console.log(`server on port: ${PORT}`);
});
