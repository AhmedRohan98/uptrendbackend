import express from 'express';
import {
  getMeHandler,
  createListingHandler,
  updateListingHandler,
  deleteListingHandler,
  yelpSearchHandler,
  googleSearchHandler,
  googleByPlaceIdHandler,
  yelpGetReviewHandler,
  getListingHandler,
  serpapiGoogleReviewHandler,
  serpapiGetGooglePlaceDetailHandler,
  serpapiYelpReviewHandler,
  serpapiYelpPlaceDetailHandler,
} from '../controllers/listing.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { restrictTo } from '../middleware/restrictTo';
import { validate } from '../middleware/validate';
import {
  createLisitngSchema,
  updateLisitngSchema,
} from '../schema/listing.schema';

const router = express.Router();

//-----for google busniness-------
import {
  authMethod,
  oauth2callback,
  fetchReviewsHandler,
} from '../controllers/googleBusiness.controller';
router.get('/auth', authMethod);
router.get('/oauth2callback', oauth2callback);
router.get('/reviews/:accountId/:locationId', fetchReviewsHandler);

router.use(deserializeUser, requireUser);

router
  .route('/')
  .get(getListingHandler)
  .post(validate(createLisitngSchema), createListingHandler)
  .put(validate(updateLisitngSchema), updateListingHandler)
  .delete(deleteListingHandler);

//yelp
router.get('/yelp', yelpSearchHandler);
router.get('/yelpGetReview', yelpGetReviewHandler);

//google
router.get('/google', googleSearchHandler);
router.get('/googlePlaceDetail', googleByPlaceIdHandler);

//serpApi for google
router.get('/getGoogleReviews', serpapiGoogleReviewHandler);
router.get('/getGooglePlaceDetail', serpapiGetGooglePlaceDetailHandler);
//serpApi for yelp
router.get('/getYelpReviews', serpapiYelpReviewHandler);
router.get('/getYelpPlaceDetail', serpapiYelpPlaceDetailHandler);
router.get('/me', getMeHandler);

export default router;
