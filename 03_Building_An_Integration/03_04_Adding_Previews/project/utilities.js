import {readFileSync, writeFileSync} from "fs";

export function fakeDatabaseGetDocument(docName) {
  return JSON.parse(readFileSync("./database.json", "utf-8"))[docName]
}

export function fakeDatabaseSetDocument(docName, doc) {
  const database = JSON.parse(readFileSync("./database.json", "utf-8"));
  database[docName] = doc;
  writeFileSync("./database.json", JSON.stringify(database));
}
