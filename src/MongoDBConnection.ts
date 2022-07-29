const {encrypt, decrypt} = require("./EncryptionHandler")
import 'dotenv/config'
import { TitleAndPassword, PasswordNecessities, encryptionObj, TitleQuery} from './interfaces'
const accountModel = require('./models/AccountModel')


// read entire the entire table named "tableName"
const readTable = async (req: any, res: any) : Promise<void> =>
{
    try {
        const table = await accountModel.find({})
        res.send(table)

    } catch (e:any) {
        res.send(e.message)
    }
}

const getPassword = async(title: string, req:any, res:any) : Promise<void> =>
{
    try {
        const account = await accountModel.findOne({title: title})
        // console.log(account)

        res.send(`your password for the ${title} account is ${decrypt({iv: account["id"], password: account["password"]})}`)
    } catch (e:any) {
        res.send(e.message)
    }
}

// return a list of accounts that can be found from the query array of titles
const getPasswords = async (req:any, res:any) : Promise<void> =>
{
    try {
        // one element passed into swagger seems to be of type string instead of array
        const arrayOfTitles = typeof(req.query.titles) === 'string' ? [req.query.titles] : req.query.titles

        const account = await accountModel.find({title: {$in: arrayOfTitles}})
        res.send(account)

    } catch (e:any) {
        res.send(e.message)
    }
}

const addPassword = async (values: PasswordNecessities, req : any, res : any) : Promise<void> =>
{
    try {
        const encrypted : encryptionObj = encrypt(values.password)
        values.password = encrypted['password']

        await accountModel.create(
            {id: encrypted['iv'],
            title: values.title,
            username: values.username,
            password: values.password,
        })

        // console.log(`saved account with title: ${values.title}`)
        res.send(`saved account with title: ${values.title}`)

    } catch (e:any) {
        res.send(e.message)
    }
}

const addPasswords = async (values: PasswordNecessities[], req : any, res : any) : Promise<void> =>
{
    try {

        for (const {title, username, password} of values)
        {
            const encrypted : encryptionObj = encrypt(password)
            const encryptedPassword : string = encrypted['password']


            var account = new accountModel({
                id: encrypted['iv'],
                title: title,
                username: username,
                password: encryptedPassword,
            })

            await account.save()
            console.log(`saved account with title: ${title}`)

        }

        // only call this when all values have been processed above
        res.send('insertion success!')

    } catch (e) {
        console.log('error')
        res.send(e)
    }

}

const deletePassword = async (title: string, req: any, res: any) : Promise<void> =>
{
    try {
        await accountModel.deleteOne({title:title})
        res.send(`deleted account with title: ${title}`)
    } catch (e:any) {
        res.send(e.message)
    }
}

const deletePasswords = async (titles: string[], req: any, res: any) : Promise<void> =>
{
    try {
        // one element passed into swagger seems to be of type string instead of array
        const arrayOfTitles = typeof(req.query.titles) === 'string' ? [req.query.titles] : req.query.titles

        const account = await accountModel.deleteMany({title: {$in: arrayOfTitles}})
        res.send(`deleted all accounts found in [${arrayOfTitles}] from the database`)

    } catch (e:any) {
        res.send(e.message)
    }
}

const updatePassword = async (title: string, newPassword: string, req: any, res: any) : Promise<void> =>
{
    try {
        const encrypted : encryptionObj = encrypt(newPassword)
        const encryptedPassword : string = encrypted['password']
        const encryptedId : string = encrypted['iv']

        await accountModel.updateOne({title:title}, {$set: {id: encryptedId, password: encryptedPassword}})
        res.send(`updated password of account with ${title}`)

    } catch (e:any) {
        res.send(e.message)
    }
}

const updatePasswords = async (accounts : TitleAndPassword[], req: any, res: any) : Promise<void> =>
{
    try {
        let results :string[] = []

        for (const {title, newPassword} of accounts)
        {
            const encrypted : encryptionObj = encrypt(newPassword)
            const encryptedPassword : string = encrypted['password']
            const encryptedId : string = encrypted['iv']
            await accountModel.updateOne({title:title}, {$set: {id: encryptedId, password: encryptedPassword}})
            results.push(title)
        }

        res.send(`accounts with successfully updated passwords ${results}`)

    } catch (e:any) {
        res.send(e.message)
    }
}


module.exports = {readTable, getPassword, getPasswords, addPassword, addPasswords, updatePassword, updatePasswords, deletePassword, deletePasswords};




