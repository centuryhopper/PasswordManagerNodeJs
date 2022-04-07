const { Client } = require("pg")
const {encrypt, decrypt} = require("./EncryptionHandler")
import 'dotenv/config'



export default class PasswordManager
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

        // connect() returns a promise
        this.client.connect()
        .then(() => console.log("connection success"))
        .then(() => this.client.query(`SELECT * from {TABLE_NAME}`))
        .then((result:any) => console.table(result.rows))
        .catch(() => console.log("connection failed"))
        .finally(() => this.client.end())
    }

    endClient() : void
    {
        this.client.end()
    }

    async addPassword(tableName: string, values: string[], req : any, res : any) : Promise<void>
    {
        const encrypted = encrypt(values[2])
        values[2] = encrypted['password']
        // console.log(values)

        const query = {
            text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5)`,
            values: [...values, encrypted['iv']]
        }

        await this.client.query(query, (err : Error, result: any) => {
            if (err)
            {
                console.log(err)
            }
            else
            {
                res.send('insertion success!')
            }

        })
        this.endClient()
    }

    async deletePassword(tableName: string, title: string, req: any, res: any) : Promise<void>
    {
        const query = {
            text: `DELETE FROM ${tableName} where title = $1`,
            values: [title]
        }
        await this.client.query(query, (err: Error, res: any) => {
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

    async updatePassword(tableName: string, title: string, newPassword: string, req: any, res: any) : Promise<void>
    {
        const encrypted = encrypt(newPassword)

        const query = {
            text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3`,
            values: [encrypted['password'], encrypted['iv'], title]
        }
        await this.client.query(query, (err : Error, res: any) => {
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

    async getPassword(tableName: string, title: string, req:any, res:any) : Promise<void>
    {
        const query = {
            text: `SELECT * FROM ${tableName} where title = $1`,
            values: [title]
        }

        await this.client.query(query, (err : Error, result: any) => {
            if (err) console.log(err);
            else
            {
                // console.log(res.rows)
                const [queriedObj] = result.rows

                const hashedPassword = decrypt({iv: queriedObj["iv"], password: queriedObj["password"]})

                // console.log(hashedPassword)
                res.send(hashedPassword)

            }
        })
    }

    // read entire the entire table named "tableName"
    async readTable(tableName: string, req: any, res: any) : Promise<void>
    {
        await this.client.query(`SELECT * FROM ${tableName}`, (err : Error, result: any) => {
            if (!err)
            {
                res.send(result.rows)
            }
            else
            {
                console.log(err.message)
            }
        })

        // await this.client.end();
    }
}


