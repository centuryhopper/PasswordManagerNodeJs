// const { Client } = require("pg")
// const {encrypt, decrypt} = require("./EncryptionHandler")
// import 'dotenv/config'
// import { TitleAndPassword, PasswordNecessities, encryptionObj, TitleQuery} from './interfaces'

// const client = new Client({
//     host: process.env.HOST,
//     user: process.env.USER,
//     port: process.env.PORT,
//     // password: process.env.PASSWORD,
//     database: process.env.DATABASE
// })

// // connect() returns a promise
// client.connect()
// .then(() => console.log("connection success"))
// // .then(() => client.query('SELECT * from password_schema.two_way_hash'))
// /*
// 'command'   │
// │    1    │  'rowCount'  │
// │    2    │    'oid'     │
// │    3    │    'rows'    │
// │    4    │   'fields'   │
// │    5    │  '_parsers'  │
// │    6    │   '_types'   │
// │    7    │  'RowCtor'   │
// │    8    │ 'rowAsArray'
// */
// // .then((result:any) => console.table(result.rows))
// .catch(async (err:any) => {
//     console.log("connection failed")
//     console.log(err.message);
//     await client.end()
// })
// // .finally(() => client.end())

// // read entire the entire table named "tableName"
// const readTable = async (tableName: string, req: any, res: any) : Promise<void> =>
// {
//     await client.query(`SELECT * FROM ${tableName}`, (err : Error, result: any) => {
//         if (!err)
//         {
//             res.send(result.rows)
//         }
//         else
//         {
//             console.log(err.message)
//             client.end()
//         }
//     })
// }

// async function getPassword(tableName: string, title: string, req:any, res:any) : Promise<void>
// {
//     const query = {
//         text: `SELECT * FROM ${tableName} where title = $1`,
//         values: [title]
//     }

//     await client.query(query, (err : Error, result: any) => {
//         if (err)
//         {
//             console.log(err)
//             client.end()
//         }
//         else
//         {
//             // console.log(res.rows)
//             const [queriedObj] = result.rows

//             const hashedPassword = decrypt({iv: queriedObj["iv"], password: queriedObj["password"]})

//             res.send({title: queriedObj['title'], username: queriedObj['username'], hashedPassword: hashedPassword})
//         }
//     })
// }

// // now works
// async function getPasswords(tableName:string, req:any, res:any) : Promise<void>
// {
//     try
//     {
//         // one element passed into swagger seems to be of type string instead of array
//         const arrayOfTitles = typeof(req.query.titles) === 'string' ? [req.query.titles] : req.query.titles
//         console.log(arrayOfTitles)

//         let queryBuilder: string = `SELECT * FROM ${tableName} WHERE `
//         let n: number = arrayOfTitles.length - 1

//         for (const [idx, title] of arrayOfTitles.entries())
//         {
//             queryBuilder += (idx < n) ? `title = '${title}' or ` : `title = '${title}'`
//         }

//         console.log(queryBuilder)

//         await client.query(queryBuilder, (err : Error, result: any) => {
//             if (err)
//             {
//                 res.send(err)
//                 client.end()
//             }
//             else
//             {

//                 let ans : {title: string, username: string, hashedPassword: string}[] = []
//                 for (const {title,username, password, iv, id} of result.rows)
//                 {
//                     const hashedPassword = decrypt({iv: iv, password: password})
//                     ans.push({title: title, username: username, hashedPassword: hashedPassword})
//                 }

//                 res.send(ans)
//             }
//         })


//     }
//     catch (error) {
//         console.log(error)

//     }
// }

// async function addPassword(tableName: string, values: PasswordNecessities, req : any, res : any) : Promise<void>
// {
//     try {
//         const encrypted : encryptionObj = encrypt(values.password)
//         values.password = encrypted['password']

//         const query = {
//             text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5) returning *`,
//             values: [...[values.title, values.username, values.password, values.id,], encrypted['iv']]
//         }

//         await  client.query(query, (err : Error, result: any) => {
//             if (err)
//             {
//                 res.send(err)
//                 client.end()
//             }
//             else
//             {
//                 res.send(`insertion success! ${result.rows}`)
//             }
//         })

//     } catch (e) {

//     }

// }

// async function addPasswords(tableName: string, values: PasswordNecessities[], req : any, res : any) : Promise<void>
// {
//     try {

//         for (const {title, username, password, id} of values)
//         {
//             const encrypted : encryptionObj = encrypt(password)
//             const encryptedPassword : string = encrypted['password']

//             const query = {
//                 text: `INSERT INTO ${tableName} (title, username, password, id, iv) VALUES ($1,$2,$3,$4,$5)`,
//                 values: [...[title, username, encryptedPassword, id,], encrypted['iv']]
//             }

//             await client.query(query, (err : Error, result: any) => {
//                 if (err)
//                 {
//                     console.log('probably a duplicate title error')
//                     res.send(err)
//                     client.end()
//                 }
//             })

//         }

//         // only call this when all values have been processed above
//         res.send('insertion success!')

//     } catch (e) {
//         console.log('error')
//         res.send(e)

//     }


// }

// async function deletePassword(tableName: string, title: string, req: any, res: any) : Promise<void>
// {
//     const query = {
//         text: `DELETE FROM ${tableName} WHERE title = $1`,
//         values: [title]
//     }
//     await client.query(query, (err: Error, result: any) => {
//         if (err)
//         {
//             res.send(err)
//             client.end()
//         }
//         else
//         {
//             res.send(`deleted the row with title = ${title}`)
//         }
//     })
// }

// async function deletePasswords(tableName: string, titles: string[], req: any, res: any) : Promise<void>
// {
//     const arrayOfTitles = typeof(titles) === 'string' ? [titles] : titles
//     for (const title of arrayOfTitles)
//     {
//         const query = {
//             text: `DELETE FROM ${tableName} where title = $1`,
//             values: [title]
//         }
//         await client.query(query, (err: Error, res: any) => {
//             if (err)
//             {
//                 console.log(err)
//                 client.end()
//             }
//         })
//     }

//     res.send(`deleted rows with titles: ${arrayOfTitles}`)
// }

// async function updatePassword(tableName: string, title: string, newPassword: string, req: any, res: any) : Promise<void>
// {
//     const encrypted = encrypt(newPassword)

//     // the returning clause will send the specified columns that were affected by the query command
//     const query = {
//         text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3 RETURNING title, password`,
//         values: [encrypted['password'], encrypted['iv'], title]
//     }
//     await client.query(query, (err : Error, result: any) => {
//         if (err)
//         {
//             console.log(err)
//             client.end()
//         }
//         else
//         {
//             res.send(`updated the password for your specified account: ${JSON.stringify(result.rows)}`)
//         }
//     })
// }

// async function updatePasswords(tableName: string, accounts : TitleAndPassword[], req: any, res: any) : Promise<void>
// {
//     console.log(`req.body: ${JSON.stringify(accounts)}`);
//     for (const account of accounts)
//     {
//         const encrypted = encrypt(account.newPassword)

//         const query = {
//             text: `UPDATE ${tableName} SET password = $1, iv = $2 WHERE title = $3 RETURNING title, password`,
//             values: [encrypted['password'], encrypted['iv'], account.title]
//         }
//         await client.query(query, (err : Error, result: any) => {
//             if (err)
//             {
//                 res.send(err)
//                 client.end()
//             }
//             else
//             {
//                 console.log(`queried: ${JSON.stringify(result.rows)}`)
//             }
//         })
//     }

//     res.send(`updated your accounts: ${JSON.stringify(accounts)}`)
// }


// module.exports = {client, readTable, getPassword, getPasswords, addPassword, addPasswords, updatePassword, updatePasswords, deletePassword, deletePasswords};




