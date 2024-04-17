import fs from "node:fs";
import csv from 'csv-parser';
import { Transform, Writable } from "node:stream";

const csvPath = new URL("../csv.csv", import.meta.url)

const readableStream = fs.createReadStream(csvPath);

const transformStreamToObject = csv({ separator: "," })

const transformStreamToString = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk))
  }
})

const writableStream = new Writable({
  write(chunk, encoding, callback) {
    const string = chunk.toString()
    const data = JSON.parse(string)
    const task = {
      title: data.title,
      description: data.description
    }
    fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    })
    callback()
  }
})

readableStream
  .pipe(transformStreamToObject)
  .pipe(transformStreamToString)
  .pipe(writableStream)