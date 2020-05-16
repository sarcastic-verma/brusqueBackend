const {Router} = require('express');
const bannersController = require('../controllers/banners-controllers');

const router = new Router();

router.get('/', bannersController.getAllBanners);
router.get('/:bid', bannersController.getBanner);
router.post('/',bannersController.createBanner);
router.delete('/:bid', bannersController.deleteBanner);
router.patch('/:bid', bannersController.updateBanner);

module.exports = router;