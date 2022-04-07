const { Client } = require("pg")
const {encrypt, decrypt} = require("./EncryptionHandler")
import 'dotenv/config'
import { TitleAndPassword, PasswordNecessities, encryptionObj} from './interfaces'

const client = new Client({
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.PORT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

// connect() returns a promise
client.connect()
.then(() => console.log("connection success"))
.then(() => client.query('SELECT * from password_schema.two_way_hash'))
/*
'command'   │
│    1    │  'rowCount'  │
│    2    │    'oid'     │
│    3    │    'rows'    │
│    4    │   'fields'   │
│    5    │  '_parsers'  │
│    6    │   '_types'   │
│    7    │  'RowCtor'   │
│    8    │ 'rowAsArray'
*/
.then((result:any) => console.table(result.rows))
.catch(async () => {
    console.log("connection failed")
    await client.end()
})
// .finally(() => client.end())

// read entire the entire table named "tableName"
const readTable = async (tableName: string, req: any, res: any) : Promise<void> =>
{
    await client.query(`SELECT * FROM ${tableName}`, (err : Error, result: any) => {
        if (!err)
        {
            res.send(result.rows)
        }
        else
        {
            console.log(err.message)
            client.end()
        }
    })

}

async function getPassword(tableName: string, title: string, req:any, res:any) : Promise<void>
{
    const query = {
        text: `SELECT * FROM ${tableName} where title = $1`,
        values: [title]
    }

    await client.query(query, (err : Error, result: any) => {
        if (err)
        {
            console.log(err)
            client.end()
        }
        else
        {
            // console.log(res.rows)
            const [queriedObj] = result.rows

            const hashedPassword = decrypt({iv: queriedObj["iv"], password: queriedObj["password"]})

            res.send(hashedPassword)
        }
    })
}

// double check
async function getPasswords(tableName: string, titles: string[], req:any, res:any) : Promise<void>
{

    let ans: string[] = []

    for (const title of titles)
    {
        const query = {
            text: `SELECT * FROM ${tableName} where title = $1`,
            values: [title]
        }

        await client.query(query, (err : Error, result: any) => {
            if (err)
            {
                console.log(err)
                client.end()
            }
            else
            {
                // console.log(res.rows)
                const [queriedObj] = result.rows

                const hashedPassword = decrypt({iv: queriedObj["iv"], password: queriedObj["password"]})

                ans.push(hashedPassword)
            }
        })

        // send the filtered result to the client
        res.send(ans)
    }

}

async function addPassword(tableName: string, values: PasswordNecessities, req : any, res : any) : Promise<void>
{
    const encrypted : encryptionObj = encrypt(values.password)
    values.password = encrypted['password']

    const query = {
        text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5)`,
        values: [...[values.title, values.username, values.password, values.id,], encrypted['iv']]
    }

    await  client.query(query, (err : Error, result: any) => {
        if (err)
        {
            console.log(err)
            client.end()
        }
        else
        {
            res.send('insertion success!')
        }
    })

}

async function addPasswords(tableName: string, values: PasswordNecessities[], req : any, res : any) : Promise<void>
{
    for (const {title, username, password, id} of values)
    {
        const encrypted : encryptionObj = encrypt(password)
        const encryptedPassword : string = encrypted['password']

        const query = {
            text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5)`,
            values: [...[title, username, encryptedPassword, id,], encrypted['iv']]
        }

        await  client.query(query, (err : Error, result: any) => {
            if (err)
            {
                console.log(err)
                client.end()
            }
            else
            {
                res.send('insertion success!')
            }
        })

    }


}

async function deletePassword(tableName: string, title: string, req: any, res: any) : Promise<void>
{
    const query = {
        text: `DELETE FROM ${tableName} where title = $1`,
        values: [title]
    }
    await client.query(query, (err: Error, res: any) => {
        if (err)
        {
            console.log(err)
            client.end()
        }
        else
        {
            console.log(`deleted the row with title = ${title}`)
            console.log(res.rows)
        }
    })
}

async function deletePasswords(tableName: string, titles: string, req: any, res: any) : Promise<void>
{
    for (const title of titles)
    {
        const query = {
            text: `DELETE FROM ${tableName} where title = $1`,
            values: [title]
        }
        await client.query(query, (err: Error, res: any) => {
            if (err)
            {
                console.log(err)
                client.end()
            }
            else
            {
            }
        })
    }

    res.send(`deleted rows with titles: ${titles}`)
}

async function updatePassword(tableName: string, title: string, newPassword: string, req: any, res: any) : Promise<void>
{
    const encrypted = encrypt(newPassword)

    const query = {
        text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3`,
        values: [encrypted['password'], encrypted['iv'], title]
    }
    await client.query(query, (err : Error, result: any) => {
        if (err)
        {
            console.log(err)
            client.end()
        }
        else
        {
            res.send(`updated the password for your specified accounts`)
        }

    })
}

async function updatePasswords(tableName: string, accounts : TitleAndPassword[], req: any, res: any) : Promise<void>
{
    for (const account of accounts)
    {
        const encrypted = encrypt(account.newPassword)

        const query = {
            text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3`,
            values: [encrypted['password'], encrypted['iv'], account.title]
        }
        await client.query(query, (err : Error, result: any) => {
            if (err)
            {
                console.log(err)
                client.end()
            }
            else
            {
            }
        })
    }

    res.send(`updates your accounts`)


}


module.exports = {client, readTable, getPassword, getPasswords, addPassword, addPasswords, updatePassword, updatePasswords, deletePassword, deletePasswords};




