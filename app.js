const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const storiesRoutes = require('./routes/stories-routes');
const followRoutes = require('./routes/follow-routes');
const usersRoutes = require('./routes/users-routes');
const bannersRoutes = require('./routes/banners-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    next();
});

app.use('/api/stories', storiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/banners', bannersRoutes);

app.use((req, res, next) => {
    throw new HttpError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'});
});

mongoose
    .connect(
        `mongodb+srv://admin101:brusque@cluster0-hacwi.mongodb.net/brusqueDB`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
    )
    .then(() => {
        app.listen(5000, () => {
            console.log("Server Started on port 5000.");
        });
    })
    .catch(err => {
        console.log(err);
    });
