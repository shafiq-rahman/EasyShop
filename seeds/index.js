const mongoose = require("mongoose")
const { allphones, alltablets, categories, cards } = require("./seedHelpers")
const { Product, Category } = require("../models/product")
const Card = require("../models/card")
const dbUrl = "mongodb://localhost:27017/easyshop"
mongoose.connect(dbUrl)
    .then(() => {
        console.log("SEEDING DATABASE")
        // seedDB()
        //     .then(() => {
        //         mongoose.disconnect()
        //     })
        seedCard()
            .then(() => {
                mongoose.disconnect()
        })
    })
    .catch(() => {
        console.log("MONGOOSE CONNECTION FAILED")
    })

async function seedDB() {
    
    await Category.deleteMany({})
    for (let category of categories) {
        const catobject = new Category({
            name: category.name,
            description: category.description,
            svg: category.svg,
            created: new Date()
        })
        await catobject.save()
    }
    await Product.deleteMany({})
    const phones = await Category.find({name: "Smartphones"})
    const tabs = await Category.find({name: "Tablets"})
    for (let product of allphones) {
        const newProduct = new Product(product)
        newProduct.category = phones[0]._id
        newProduct.created = new Date()
        await newProduct.save()
    }
    for (let product of alltablets) {
        const newProduct = new Product(product)
        newProduct.category = tabs[0]._id
        newProduct.created = new Date()
        await newProduct.save()
    }
}

async function seedCard() {
    await Card.deleteMany({})
    for (let card of cards) { 
        const newCard = new Card(card)
        await newCard.save()
    }
}
