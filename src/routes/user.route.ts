import express from 'express';
import {
  getAllUsersHandler,
  getMeHandler,
  updateProfileHandler,
  handleFileUpload,
  handleSendMessage,
  handleStripeCheckOut,
  handleStripeCheckOutSuccess,
  handleStripeCheckOutCanceled,
  getUserHandler,
  subscriptionDetailhandler,
} from '../controllers/user.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { restrictTo } from '../middleware/restrictTo';
import { validate } from '../middleware/validate';
import { updateUserSchema, sendMessageSchema } from '../schema/user.schema';

const router = express.Router();

router.get('/stripePaymentSuccess', handleStripeCheckOutSuccess);
router.get('/stripePaymentCanceled', handleStripeCheckOutCanceled);

router.use(deserializeUser, requireUser);

router
  .route('/')
  .get(getUserHandler)
  .put(validate(updateUserSchema), updateProfileHandler);
// .delete(authenticate, PropertyController.);

router.post('/upload', handleFileUpload);

router.post('/sendMessage', validate(sendMessageSchema), handleSendMessage);

router.get('/stripePayment', handleStripeCheckOut);

// Get my info route
router.get('/me', getMeHandler);

// for admin routes
router.use(restrictTo('admin'));
router.route('/admin').get(getAllUsersHandler);
// .put();
// .delete();
router.route('/subscription').get(subscriptionDetailhandler);

export default router;
