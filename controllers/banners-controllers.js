const Banner = require('../models/banner');
const HttpError = require('../models/http-error');

const getAllBanners = async (req, res, next) => {
    let Banners;
    try {
        Banners = await Banner.find();
    } catch (err) {
        const error = new HttpError(
            'Fetching Banners failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!Banners || Banners.length === 0) {
        return next(
            new HttpError('Could not find any Banners at the moment.', 404)
        );
    }
    await res.json({
        banners: Banners.map(banner =>
            banner.toObject({getters: true})
        )
    });
};
const getBanner = async (req, res, next) => {
};
const createBanner = async (req, res, next) => {
};
const updateBanner = async (req, res, next) => {
};
const deleteBanner = async (req, res, next) => {
};

exports.getAllBanners = getAllBanners;
exports.getBanner = getBanner;
exports.createBanner = createBanner;
exports.updateBanner = updateBanner;
exports.deleteBanner = deleteBanner;
