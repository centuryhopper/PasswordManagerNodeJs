// const thisIsAString : string = 'hi'
// const thisIsAnArray : number[] = [1,2,3]
// console.log(thisIsAString)
// console.log(thisIsAnArray)

// for an interactive run, type "npm run dev"
// or for a one-time run, type "tsc && node ./js_files/app.js"

// *** database, schema, and table creation should be done from postgresql ***

import { lst } from "./secretList"
import express from "express"
// import PasswordManager from "./PasswordManager"
const {client, readTable, getPassword, getPasswords, addPassword, addPasswords, updatePassword, updatePasswords, deletePassword, deletePasswords,} = require("./PostgresConnection")
const PORT = 3001;
const BASE_PATH : string = "/passwords"
const app = express()
const TABLE_NAME : string = 'password_schema.two_way_hash'
const bodyParser = require("body-parser");
app.use(bodyParser.json());


app.get(BASE_PATH, async (req, res) => {
    await readTable(TABLE_NAME, req, res)
})

app.get(`${BASE_PATH}/:title`, async (req , res) => {
    await getPassword(TABLE_NAME, req.params.title, req, res)
})

app.get(`${BASE_PATH}/:titles`, async (req , res) => {
    await getPasswords(TABLE_NAME, req.params.titles, req, res)
})

app.put(`${BASE_PATH}/:title/:newPassword`, async (req, res) => {
    await updatePassword(TABLE_NAME,req.params.title , req.params.newPassword, req, res)
})

app.put(`${BASE_PATH}/:accounts`, async (req, res) => {
    await updatePasswords(TABLE_NAME,req.params.accounts, req, res)
})

app.delete(`${BASE_PATH}/:title`, async (req, res) => {
    await deletePassword(TABLE_NAME, req.params.title, req, res)
})

app.delete(`${BASE_PATH}/:titles`, async (req, res) => {
    await deletePasswords(TABLE_NAME, req.params.titles, req, res)
})

app.post(BASE_PATH, async (req , res) => {
    // get data from frontend
    const {title, username, password, id} = req.body
    await addPassword(TABLE_NAME, [title, username, password, id], req,res)
})

app.post(`${BASE_PATH}/many`, async (req , res) => {
    // get data from frontend
    const {title, username, password, id} = req.body
    await addPasswords(TABLE_NAME, [title, username, password, id], req,res)
})


app.listen(PORT, () => console.log("server is running"))


/*
TODO:

- connect to postgresql database (locally)
- create a password manager that handles storing retrieving passwords from the database

*/



