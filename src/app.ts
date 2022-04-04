// const thisIsAString : string = 'hi'
// const thisIsAnArray : number[] = [1,2,3]
// console.log(thisIsAString)
// console.log(thisIsAnArray)

// for an interactive run, type "npm run dev"
// or for a one-time run, type "tsc && node ./js_files/app.js"

// *** database, schema, and table creation should be done from postgresql ***

const { Client } = require("pg")
const {encrypt, decrypt} = require("./EncryptionHandler")
import 'dotenv/config'
import { lst } from "./secretList"
const prompt = require("prompt-sync")({ sigint: true });

enum Choices
{
    QUIT,
    READ_TABLE,
    ADD_PASSWORD,
    DELETE_PASSWORD,
    GET_PASSWORD
}

class PasswordManager
{
    client: any

    constructor()
    {
        this.client = new Client({
            host: process.env.HOST,
            user: process.env.USER,
            port: process.env.PORT,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        })

        this.client.connect((err : Error) => {
            if (err) {
              console.error('connection error: ', err.stack)
            } else {
              console.log('connected')
            }
        })
    }

    endClient() : void
    {
        this.client.end()
    }

    addPassword(tableName: string, values: string[]) : void
    {
        const encrypted = encrypt(values[2])
        values[2] = encrypted['password']
        // console.log(values)

        const query = {
            text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5)`,
            values: [...values, encrypted['iv']]
        }

        this.client.query(query, (err : Error, res: any) => {
            if (err)
            {
                console.log(err)
            }
            else
            {
                console.log(res.rows)
            }

        })
    }

    deletePassword(tableName: string, title: string) : void
    {
        const query = {
            text: `DELETE FROM ${tableName} where title = $1`,
            values: [title]
        }
        this.client.query(query, (err: Error, res: any) => {
            if (err)
            {
                console.log(err)
            }
            else
            {
                console.log(`deleted the row with title = ${title}`)
                console.log(res.rows)
            }
        })
    }

    updatePassword(tableName: string, title: string, newPassword: string) : void
    {
        const encrypted = encrypt(newPassword)

        const query = {
            text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3`,
            values: [encrypted['password'], encrypted['iv'], title]
        }
        this.client.query(query, (err : Error, res: any) => {
            if (err)
            {
                console.log(err)
            }
            else
            {
                console.log(`updated the password for your ${title} account`)
                console.log(res)
            }

        })
    }

    getPassword(tableName: string, title: string) : void
    {
        const query = {
            text: `SELECT * FROM ${tableName} where title = $1`,
            values: [title]
        }

        this.client.query(query, (err : Error, res: any) => {
            if (err) console.log(err);
            else
            {
                // console.log(res.rows)
                const [queriedObj] = res.rows

                const hashedPassword = decrypt({iv: queriedObj["iv"], password: queriedObj["password"]})

                console.log(hashedPassword)

            }
        })
    }

    // read entire the entire table named "tableName"
    readTable(tableName: string) : void
    {
        this.client.query(`SELECT * FROM ${tableName}`, (err : Error, res: any) => {
            if (!err)
            {
                console.log(res.rows)
            }
            else
            {
                console.log(err.message)
            }
        })


    }
}


function main() : void
{
    let pwdManager: PasswordManager = new PasswordManager()
    // pwdManager.updatePassword("password_schema.two_way_hash", '1', '400')

    // pwdManager.deleteRow("password_schema.two_way_hash", '1')

    // pwdManager.readTable("password_schema.two_way_hash")

    // pwdManager.getPassword("password_schema.two_way_hash", "")

    // for (const row of lst)
    // {
    //     pwdManager.addRow("password_schema.two_way_hash", [row['title'], row['username'],row['password'], row['id'],])
    // }



    /*
    // let isDone : boolean = false

    // console.log("What do you want to do?")
    // console.log("(1) to read the entire table")
    // console.log("(2) to add a password")
    // console.log("(3) to delete a password")
    // console.log("(4) to get a password")
    // console.log("(0) to quit");


    // main loop
    // while (!isDone)
    // {
    //     const choice: number = Number(prompt("which choice?"))
    //     switch(choice)
    //     {
    //         case Choices.READ_TABLE:
    //             console.log("entire table:")
    //             pwdManager.readTable("password_schema.two_way_hash").then((result) => {
    //                 console.log("result ", result)
    //             }).catch((err) => {
    //                 console.log(err)
    //             });
    //             break;
    //         case Choices.ADD_PASSWORD:
    //             console.log("ADD_PASSWORD");
    //             break;
    //         case Choices.DELETE_PASSWORD:
    //             console.log("DELETE_PASSWORD");
    //             const id = prompt("id of row")
    //             const title = prompt("title of row")
    //             pwdManager.deleteRow("password_schema.two_way_hash", Number(id), title)
    //             break;
    //         case Choices.GET_PASSWORD:
    //             console.log("GET_PASSWORD");
    //             break;
    //         default:
    //             console.log("QUIT");
    //             isDone = true;
    //             pwdManager.endClient()
    //             break;
    //     }
    // }
    */

    // pwdManager.addRow("password_schema.two_way_hash", ['dummy_title', 'dummy_username', 'dummy_password', 'dummy_id',])

    // pwdManager.readTable("password_schema.two_way_hash")
    // pwdManager.getPassword("password_schema.two_way_hash", "dummy_title", "dummy_id")

    // pwdManager.endClient()

}





main()




/*
TODO:

- connect to postgresql database (locally)
- create a password manager that handles storing retrieving passwords from the database

*/
