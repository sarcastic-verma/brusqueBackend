const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Story = require('../models/story');
const User = require('../models/user');

const getStory = async (req, res, next) => {
    let stories;
    try {
        stories = await Story.find();
    } catch (err) {
        const error = new HttpError(
            'Fetching stories failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!stories || stories.length === 0) {
        return next(
            new HttpError('Could not find any stories at the moment.', 404)
        );
    }
    await res.json({
        stories: stories.map(story =>
            story.toObject({getters: true})
        )
    });
};
const getStoryById = async (req, res, next) => {
    const storyId = req.params.sid;

    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a story.',
            500
        );
        return next(error);
    }

    if (!story) {
        const error = new HttpError(
            'Could not find story for the provided id.',
            404
        );
        return next(error);
    }

    await res.json({story: story.toObject({getters: true})});
};

const getStoriesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let stories;
    let userWithStories;
    try {
        userWithStories = await User.findById(userId).populate('stories');
    } catch (err) {
        const error = new HttpError(
            'Fetching stories failed, please try again later.',
            500
        );
        return next(error);
    }

    // if (!stories || stories.length === 0) {
    if (!userWithStories) {
        return next(
            new HttpError('Could not find provided user id.', 404)
        );
    }

    await res.json({
        stories: userWithStories.stories.map(story =>
            story.toObject({getters: true})
        )
    });
};

const createStory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const {title, intro, description, creator} = req.body;

    const createdStory = new Story({
        title,
        description,
        intro,
        image: req.file.path,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'Creating story failed, please try again.',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdStory.save({session: sess});
        user.stories.push(createdStory);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating story failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({story: createdStory});
};

const updateStory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const {title, intro, description} = req.body;
    const storyId = req.params.sid;

    let story;
    try {
        story = await Story.findById(storyId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update story.',
            500
        );
        return next(error);
    }

    story.title = title;
    story.intro = intro;
    story.description = description;

    try {
        await story.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update story.',
            500
        );
        return next(error);
    }

    res.status(200).json({
        story: story.toObject(
            {getters: true})
    });
};

const deleteStory = async (req, res, next) => {
    const StoryId = req.params.sid;

    let story;
    try {
        story = await Story.findById(StoryId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete story.',
            500
        );
        return next(error);
    }

    if (!story) {
        const error = new HttpError('Could not find story for this id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await story.remove({session: sess});
        story.creator.stories.pull(story);
        await story.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete story.',
            500
        );
        return next(error);
    }

    res.status(200).json({message: 'Deleted story.'});
};

exports.getStoryById = getStoryById;
exports.getStoriesByUserId = getStoriesByUserId;
exports.createStory = createStory;
exports.updateStory = updateStory;
exports.deleteStory = deleteStory;
exports.getStory = getStory;