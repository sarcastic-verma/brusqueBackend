const HttpError = require('../models/http-error');
const User = require('../models/user');
const mongoose = require('mongoose');

const getFollowers = async (req, res, next) => {
    let userWithFollowers;
    const userId = req.params.uid;
    try {
        userWithFollowers = await User.findById(userId).populate('followers');
    } catch (err) {
        const error = new HttpError("Something went wrong, can't fetch followers", 500);
        return next(error);
    }
    if (!userWithFollowers) {
        return next(new HttpError("No user find for this id", 404));
    }

    await res.json({
        followers: userWithFollowers.followers.map(
            follower => follower.toObject({getter: true})
        )
    });
};

const getFollowing = async (req, res, next) => {

    let userWithFollowing;
    const userId = req.params.uid;
    try {
        userWithFollowing = await User.findById(userId).populate('following');
    } catch (err) {
        const error = new HttpError("Something went wrong, can't fetch following", 500);
        return next(error);
    }
    if (!userWithFollowing) {
        return next(new HttpError("No user find for this id", 404));
    }

    await res.json({
        following: userWithFollowing.following.map(
            following => following.toObject({getter: true})
        )
    });
};

const follow = async (req, res, next) => {
    const userId = req.params.uid;
    const loggedInUserId = req.userData.userId;
    const loggedInUser = await User.findById(loggedInUserId);

    if (loggedInUserId !== userId) {
        let userToFollow;
        try {
            userToFollow = await User.findById(userId).populate('following');
        } catch (err) {
            const error = new HttpError("Something went wrong, can't fetch following", 500);
            return next(error);
        }
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            userToFollow.followers.push(loggedInUserId);
            loggedInUser.following.push(userId);
            userToFollow.save();
            loggedInUser.save();
            sess.commitTransaction();
        } catch (err) {
            return next(new HttpError("Following user failed", 500));
        }
        res.status(201).json(
            {message: "User followed"});
    } else {
        res.status(500).json({
            message: "Can't follow yourself"
        });
    }

};

exports.follow = follow;
exports.getFollowers = getFollowers;
exports.getFollowing = getFollowing;