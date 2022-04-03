// const thisIsAString : string = 'hi'
// const thisIsAnArray : number[] = [1,2,3]
// console.log(thisIsAString)
// console.log(thisIsAnArray)

// for an interactive run, type "npm run dev"
// or for a one-time run, type "tsc && node ./js_files/app.js"

const { Client } = require("pg")
const {encrypt, decrypt} = require("./EncryptionHandler")
import 'dotenv/config'
const prompt = require("prompt-sync")({ sigint: true });

// const age = prompt("How old are you? ");
// console.log(`You are ${age} years old.`);

const client = new Client({
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.PORT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

client.connect((err : Error) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })

// let isDone : boolean = false
// main loop
// while (!isDone)
// {

// }

class PasswordManager
{
    client: any;

    constructor(client: any)
    {
        this.client = client;
    }


    addRow(tableName: string, values: string[]) : void
    {
        const query = {
            text: `INSERT INTO ${tableName} (title, username, password, iv, id) VALUES ($1,$2,$3,$4,$5)`,
            values: values
        }
        client.query(query, (err : Error, res: any) => {
            if (err)
            {
                console.log(err)
            }
            else
            {
                console.log(res.rows);
            }

        })
    }

    deleteRow(id: number) : void
    {

    }

    getRow(id: number) : void
    {

    }

    // read entire the entire table named "tableName"
    readTable(tableName: string) : void
    {
        client.query(`SELECT * FROM ${tableName}`, (err : any, res: any) => {
            if (!err) console.log(res.rows)
            else console.log(err.message)
        })
    }
}


function main() : void
{
    let pwdManager: PasswordManager = new PasswordManager(client)

    pwdManager.readTable("password_schema.two_way_hash")

    // pwdManager.addRow("password_schema.two_way_hash", ['dummy_title', 'dummy_username', 'dummy_password', 'dummy_iv', 'dummy_id',])

    // client.end()
}

main()




/*
TODO:

- connect to postgresql database (locally)
- create a password manager that handles storing retrieving passwords from the database

*/
