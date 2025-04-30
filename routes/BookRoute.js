const express = require('express')
const router = express.Router()
const Books = require('../models/BookModel')
const auth = require('../middleware/auth')




router.get('/',auth,async(req,res) => {
    try{
        const fetchedbooks = await Books.find()
        res.status(200).json(fetchedbooks)
    }
    catch(error){
        res.status(400).json(error)
    }
})


router.post('/add',async(req,res) => {
    try {
        const {title,author,description,price,imageUrl,overview,language,genre,publisher,_id} = req.body 
        if(!title || !author || !description  || !price || !imageUrl || !overview || !language || !genre || !publisher){
            return res.status(400).json({message:"title & desc Required"})
        }
        const newbookdata = new Books(req.body)
        const savedata = await newbookdata.save();
        res.status(201).json({message:'added'});
    } catch (error) {
        res.status(500).json(error)
    }
})


router.put('/edit/:id',async(req,res) => {
    try {
        const id = req.params.id;
        const currentrecord = await Books.findById(id)
        if(!currentrecord){
            return res.status(404).json({message:"Book not found"})
        }
        const updateBook = await Books.findByIdAndUpdate(id,req.body,{new: true})
        res.status(200).json(updateBook)
    } catch (error) {
        res.status(500).json(error)
    }
})


router.delete('/delete/:id',async(req,res) => {
    try {
        const id = req.params.id;
        const currentrecord = await Books.findById(id);
        if(!currentrecord){
            return res.status(404).json({message:"Book not found !"})
        }
        const deleteBook = await Books.findByIdAndDelete(id)
        res.status(200).json({message:"Book deleted"})
    } catch (error) {
        res.status(500).json(error)
    }
})





module.exports = router