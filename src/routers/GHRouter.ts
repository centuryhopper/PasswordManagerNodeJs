const { v4 } = require('uuid')
const {encrypt, decrypt} = require("../EncryptionHandler")
import 'dotenv/config'
import express from 'express'
import { GitHubSecretsFormat, encryptionObj, Pair, TitleAndPassword} from '../interfaces'

const GHModel = require('../models/GitHubRepoModel')
const router = express.Router()

router.route('/getAll').get(async (req: any, res: any) : Promise<void> =>
{
    try {
        const table = await GHModel.find({})
        res.send(table)

    } catch (e:any) {
        res.send(e.message)
    }
})

router.route('/getOne/:title').get(async (req:any, res: any) => {
    try {
        const account = await GHModel.findOne({title: req.params.title})
        // console.log(account)

        let secrets: string[] = account['secrets'].map(
            (val: {iv: string, password: string}) => decrypt({iv: val.iv, password: val.password})
        )

        // console.log(secrets)

        res.send(`your passwords for the ${req.params.title} account are: ${secrets}`)
    } catch (e:any) {
        res.send(e.message)
    }
})

router.route('/get').get(async (req:any, res:any) : Promise<void> =>
{
    try {
        // one element passed into swagger seems to be of type string instead of array
        /*
        req.body input format
        [
            {title: 'some_title'}
        ]
        */
        const titles : {title:string}[] = req.body
        const arrayOfTitles = titles.map((o:{title:string}) => o.title)

        // console.log(arrayOfTitles)

        const accounts = await GHModel.find({title: {$in: arrayOfTitles}})

        // console.log(accounts)

        /*
        [
            {
                title: "",
                {
                    secrets: []
                },
            },
        ]
        */

        let ans : any[] = []

        for (const {title, secrets} of accounts)
        {
            let obj = {title: title, secrets:[] as string[]}
            obj.secrets = secrets.map((o:{iv: string, password: string}) => decrypt({iv: o.iv, password: o.password}))
            ans.push(obj)
        }

        res.send(ans)

    } catch (e:any) {
        res.send(e.message)
    }
})

router.route('/postOne').post(async (req : any, res : any) : Promise<void> =>
{
    /*
    req.body input example
    {
        "title" : "FlightScraper",
        "secrets": {
            0: "travelMap={\"source\":\"ORL\",\"destination\":\"LAX\"}"
        }
    }
    */
    const values = req.body
    try {

        var newSecrets : {iv: string, password: string}[] = []
        for (const password of Object.values(values.secrets))
        {
            const encrypted : encryptionObj = encrypt(password)
            newSecrets.push({iv: encrypted['iv'], password: encrypted['password']})
        }

        // console.log(newSecrets)

        await GHModel.create(
            {
                id: v4(),
                title: values.title,
                secrets: newSecrets,
            }
        )

        res.send(`saved account with title: ${values.title}`)

    } catch (e:any) {
        res.send(e.message)
    }
})

router.route('/post').post(async (req : any, res : any) : Promise<void> =>
{
    try {
        var values : GitHubSecretsFormat[] = req.body

        for (const {title, secrets} of values)
        {
            let newSecrets : {iv: string, password: string}[] = []
            for (const password of Object.values(secrets))
            {
                const encrypted : encryptionObj = encrypt(password)
                newSecrets.push({iv: encrypted['iv'], password: encrypted['password']})
            }

            var account = new GHModel({
                id: v4(),
                title: title,
                secrets: newSecrets,
            })

            await account.save()
            console.log(`saved account with title: ${title}`)
        }

        // only call this when all values have been processed above
        res.send('inserted all gh accounts!')

    } catch (e) {
        console.log('error')
        res.send(e)
    }
})

const updatePassword = async (title: string, secrets: {[key:string]: string}, statusArray: string[]) : Promise<void> =>
{
    var newSecrets : { iv: string, password: string }[] = []
    for (const password of Object.values(secrets))
    {
        const encrypted : encryptionObj = encrypt(password)
        newSecrets.push({iv: encrypted['iv'], password: encrypted['password']})
    }
    await GHModel.updateOne({title:title}, {$set: {secrets: newSecrets}})
    statusArray.push(`updated password of account with ${title}`)
}

router.route('/updateOne').put(async (req : any, res : any) : Promise<void> =>
{
    /*
    req.body input example
    {
        "title" : "FlightScraper",
        "secrets": {
            '0': "travelMap={\"source\":\"ORL\",\"destination\":\"LAX\"}"
        }
    }
    */

   // in the future we should probably let the user enter the old password for verification purposes
   // before updating this account to the new password

   try {
        const { title, secrets } = req.body
        let statusArray : string[] = []
        await updatePassword(title, secrets, statusArray)
        res.send(statusArray)
    } catch (error:any) {
        res.send(error.message)
    }
})

router.route('/updateMany').put(async (req : any, res : any) : Promise<void> =>
{
    /*
        req.body input example
        [
            {
                "title" : "a",
                "secrets": {
                    0: "abc"
                }
            },
            {
                "title" : "b",
                "secrets": {
                    0: "def",
                    1: "ghi"
                }
            },
        ]
    */
    try {
        const arrayofUpdatedAccounts : { title: string, secrets: { [key:string]:string } }[]= req.body
        let statusArray : string[] = []
        for (const {title, secrets} of arrayofUpdatedAccounts)
        {
            await updatePassword(title, secrets, statusArray)
        }
        res.send(statusArray)
    } catch (error:any) {
        res.send(error.message)
    }
})


// var test : {[key:string]:string} = {
//     '1': '2',
//     2:'2'
// }


// const deletePassword = async (title: string, req: any, res: any) : Promise<void> =>
// {
//     try {
//         await GHModel.deleteOne({title:title})
//         res.send(`deleted account with title: ${title}`)
//     } catch (e:any) {
//         res.send(e.message)
//     }
// }

// const deletePasswords = async (titles: string[], req: any, res: any) : Promise<void> =>
// {
//     try {
//         // one element passed into swagger seems to be of type string instead of array
//         const arrayOfTitles = typeof(req.query.titles) === 'string' ? [req.query.titles] : req.query.titles

//         const account = await GHModel.deleteMany({title: {$in: arrayOfTitles}})
//         res.send(`deleted all accounts found in [${arrayOfTitles}] from the database`)

//     } catch (e:any) {
//         res.send(e.message)
//     }
// }


module.exports = router
