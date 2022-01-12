var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { response } = require('../app')
const { promise } = require('bcrypt/promises')
const async = require('hbs/lib/async')

module.exports = {
    //Function for user signup
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    //Function for user login
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed");
                resolve({ status: false })
            }
        })
    },   
    //Function to add book in bookshelf 
    addToBookShelf: (bookId, userId) => {
        let bukObj = {
            item: objectId(bookId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let bukExist = userCart.book.findIndex(book => book.item == bookId)
                console.log(bukExist);
                if (bukExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'book.item': objectId(bookId) },
                    {  
                        $inc: { 'book.$.quantity': 1 } 
                    }).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ user: objectId(userId) },
                    {
                        $push: { book: bukObj }
                    }).then((response) => {
                        resolve()
                    })
                }
            } else {    
                let shelfObj = {
                    user: objectId(userId),
                    book: [bukObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(shelfObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    //Function to get user book count in shelf
    bookShelfCount:(userId) => {
        return new Promise(async(resolve,reject) => {
            let userShelf = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            let count = 0
            if(userShelf) {
                count = userShelf.book.length
            }
            resolve(count)
            console.log('count:',count);
        })
    },
    //Function to display shelf books
    getShelfBooks: (userId) => {
        return new Promise(async (resolve, reject) => {
            let shelfItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$book'
                },
                {
                    $project: {
                        item: '$book.item',
                        quantity: '$book.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.BOOK_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'book'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, book: { $arrayElemAt: ['$book', 0] }
                    }
                }
            ]).toArray()
            console.log(shelfItems);
            resolve(shelfItems)
        })
    },
    //Function to return book from bookshelf
    returnBook:(userId,bookId) => {
        return new Promise(async(resolve,reject) => {
            let user= await db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id: objectId(userId) },
                {
                    $pull: { book: { item: objectId(bookId) } }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    }    
}