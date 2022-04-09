// for an interactive run, type "npm run dev"
// or for a one-time run, type "tsc && node ./js_files/app.js"

// *** database, schema, and table creation should be done from postgresql ***

import { lst } from "./secretList"
import express from "express"
require('express-async-errors')
const cors = require('cors')
import { v4 as uuidv4 } from 'uuid'
const {client, readTable, getPassword, getPasswords, addPassword, addPasswords, updatePassword, updatePasswords, deletePassword, deletePasswords,} = require("./PostgresConnection")
const PORT = 3001;
const BASE_PATH : string = "/passwords"
const app = express()
const TABLE_NAME : string = 'password_schema.two_way_hash'
import bodyParser from "body-parser"
const YAML = require('yamljs')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = YAML.load('./swagger.yaml');


// console.log(swaggerDocument)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())


app.get(BASE_PATH, async (req, res) => {
    await readTable(TABLE_NAME, req, res)
})

app.get(`${BASE_PATH}/:title`, async (req , res) => {
    await getPassword(TABLE_NAME, req.params.title, req, res)
})

app.get(`${BASE_PATH}/accounts/many`, async (req , res) => {
    await getPasswords(TABLE_NAME, req, res)
})

app.put(`${BASE_PATH}/:title/:newPassword`, async (req, res) => {
    await updatePassword(TABLE_NAME,req.params.title , req.params.newPassword, req, res)
})

app.put(`${BASE_PATH}/accounts/many/updates`, async (req, res) => {
    await updatePasswords(TABLE_NAME, req.body, req, res)
})

app.delete(`${BASE_PATH}/:title`, async (req, res) => {
    await deletePassword(TABLE_NAME, req.params.title, req, res)
})

app.delete('/delete/accounts/many', async (req, res) => {
    await deletePasswords(TABLE_NAME, req.query.titles, req, res)
})

app.post("/create", async (req , res) => {
    // get data from frontend
    const {title, username, password} = req.body
    await addPassword(TABLE_NAME, {title, username, password, id:uuidv4()}, req,res)
})

app.post('/create/accounts/many', async (req , res) => {
    // get data from frontend
    let data = req.body
    data = data.map((obj:any) => ({...obj, id:uuidv4()}))
    console.log(data)

    await addPasswords(TABLE_NAME, data, req, res)
})


app.listen(PORT, () => console.log("server is running"))


/*
TODO:

- connect to postgresql database (locally)
- create a password manager that handles storing retrieving passwords from the database

*/



