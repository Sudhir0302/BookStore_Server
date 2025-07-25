const express = require('express')
const router = express.Router();
const users = require('../models/userModel')
const bcrypt = require('bcrypt');
const books = require('../models/BookModel')
const jwt=require("jsonwebtoken");
const auth = require('../middleware/auth');
require('dotenv').config();

router.post('/register', async (req,res) => {
	try {
		const {name,email,password} = req.body
		const finduser = await users.findOne({email:email})
		if(finduser!==null){
			return res.status(400).json({message:"Email Already exists"})
		}       
		if(!name || !email || !password){
			return res.status(400).json({message:"All fields are required"})
		}
		
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserData = new users({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUserData.save();
		res.status(200).json(savedUser)

	} catch (error) {
		console.log(error)
		res.status(500).json({message:"Internal server error"})
	}
})


router.post('/check',async(req,res)=>{
    try {
        const decode=jwt.verify(req.cookies.token,process.env.secret_key);
        // console.log(decode)
        const finduser=await users.findOne({email:decode.email})
        if(!finduser){
            return res.status(404).json({msg:"user not foun"})
        }
        res.status(200).json({user:finduser})
    } catch (error) {
        res.status(401).send("failed")
    }
})


router.post('/signout',async(req,res)=>{
    try{
        res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false, 
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }catch(err){
        res.send(err);
    }
})

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const finduser = await users.findOne({ email: email });

        if (!finduser) {
            return res.status(400).json({ message: "No Email Exists Please Signup or check email" });
        }

        const isPasswordValid = await bcrypt.compare(password, finduser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token=jwt.sign({email:email,role:finduser.role},process.env.secret_key,{expiresIn:"1h"})

        // console.log(token);

        res.cookie("token",token,{
            httpOnly: true,
            secure: process.env.dev!="dev", //"true means : Only send this cookie over HTTPS connections."
            sameSite: 'none',  //if samesite none means cross-origin is enabled ,so it is prone to csrf attack.Protect it by enabling cors for a specified domains only
            maxAge: 3600000 
        }).status(200).json({message:"Login successfull",user:finduser});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.put('/addcart', auth,async (req, res) => {
    const { userId, bookId } = req.body;

    try {
        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = await books.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const isAlreadyInCart = user.cart_items.some(
            (item) => item._id === bookId
        );

        if (isAlreadyInCart) {
            return res.status(400).json({ message: 'Book already in cart' });
        }

        user.cart_items.push(book);
        await user.save();

        return res.status(200).json({ message: 'Book added to cart', user });
    } catch (error) {
        console.error('Error adding to cart:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/deletecart', auth,async (req, res) => {
    const { userId, index } = req.body; 

    try {
        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (index < 0 || index >= user.cart_items.length) {
            return res.status(400).json({ message: 'Invalid index' });
        }
        
        user.cart_items.splice(index, 1);
        await user.save(); 
        
        res.status(200).json({ message: 'Cart item deleted successfully', cart_items: user.cart_items });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/getcart/:userid',auth,async(req,res) => {
    try {
        const {userid} = req.params;
        const user = await users.findById(userid);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({cart:user})
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
})


module.exports = router