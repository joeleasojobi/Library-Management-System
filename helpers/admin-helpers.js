var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { response } = require('../app')
const async = require('hbs/lib/async')


module.exports = {
    //Function for admin signup
    doSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    //Function for admin login
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.admin = admin
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
    //Function to add book
    addBook: (adminData) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BOOK_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    //Function to display books
    getBook:() => {
        return new Promise(async(resolve,reject) => {
            let book=await db.get().collection(collection.BOOK_COLLECTION).find().toArray()
            resolve(book)
        })
    },
    //Function to get book details for editing
    getBookDetails:(bookId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BOOK_COLLECTION).findOne({_id:objectId(bookId)}).then((book) => {
                resolve(book)
            })
        })
    },
    //Function to get the members list
    getMember:() => {
        return new Promise(async(resolve,reject) => {
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    //Function to update book details
    updateBook:(bookId,bookDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BOOK_COLLECTION).updateOne({_id:objectId(bookId)},{
               $set:{
                    No:bookDetails.No,
                    Name:bookDetails.Name,
                    Author:bookDetails.Author,
                    Category:bookDetails.Category,
                    Status:bookDetails.Status
               } 
            }).then((response)=>{
                 resolve()
                })
        })
    },
    //Function to delete a book
    deleteBook:(bookId)=>{
        return new Promise((resolve,reject)=>{
            console.log(bookId)
            console.log(objectId(bookId));
            db.get().collection(collection.BOOK_COLLECTION).deleteOne({_id:objectId(bookId)}).then((response)=>{
                resolve(response)
            })
        })
    },
}   
