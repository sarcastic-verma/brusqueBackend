const express = require('express');
const {check} = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', usersController.getUsers);

router.get('/:uid', usersController.getUserById);

router.post(
    '/signup',
    fileUpload.single('image'),
    [
        check('username')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password').isLength({min: 6})
    ],
    usersController.signup
);

router.post('/login', usersController.login);

router.get('/search/:query', usersController.searchUsers);
router.use(checkAuth);
router.patch('/edit/:uid', usersController.editUser);
module.exports = router;
