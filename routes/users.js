const router=require("express").Router();
const bcrypt=require("bcrypt");
const User = require("../models/User");

//update user
router.put("/:id", async (req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt= await bcrypt.genSalt(10);
                req.body.password= await bcrypt.hash(req.body.password,salt);
            }catch(error){
                return res.status(500).json(error);
            }
        }
        try{
            const user=await User.findByIdAndUpdate(req.params.id,{
                $set: req.body,
            });
            res.status(200).json("account has been updated");
        }catch(error){
            res.send(500).json(error);
        }
    } else{
        return res.status(403).json("you can update only your account");
    }
})

//delete user
router.delete("/:id", async (req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            const user=await User.findByIdAndDelete(req.params.id);
            res.status(200).json("account has been deleted");
        }catch(error){
            res.send(500).json(error);
        }
    } else{
        return res.status(403).json("you can delete only your account");
    }
})

//get user
router.get("/:id",async (req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        const {password, updatedAt, createdAt, isAdmin, ...other}= user._doc;
        res.status(200).json(other);
    }catch(err){
        res.status(500).json(err);
    }
})

//follow user
router.put("/:id/follow", async (req,res)=>{
    if(req.body.userId !== req.params.id){
        const user=await User.findById(req.params.id);
        const currentuser=await User.findById(req.body.userId);
        if(!user.followers.includes(req.body.userId)){
            await user.updateOne({$push:{followers:req.body.userId}});
            await currentuser.updateOne({$push:{following:req.params.id}});
            res.status(200).json("user has been followed");
        }else{
            res.status(403).json("you already follow");
        }
    } else{
        res.status(403).json("you cannot follow yourself");
    }
})

//unfollow user
router.put("/:id/unfollow", async (req,res)=>{
    if(req.body.userId !== req.params.id){
        const user=await User.findById(req.params.id);
        const currentuser=await User.findById(req.body.userId);
        if(user.followers.includes(req.body.userId)){
            await user.updateOne({$pull:{followers:req.body.userId}});
            await currentuser.updateOne({$pull:{following:req.params.id}});
            res.status(200).json("user has been unfollowed");
        }else{
            res.status(403).json("you do not follow this person");
        }
    } else{
        res.status(403).json("you cannot unfollow yourself");
    }
})

module.exports= router