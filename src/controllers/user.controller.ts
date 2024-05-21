import { NextFunction, Request, Response } from 'express';
import {
  findAllUsers,
  updateUser,
  findUserById,
} from '../services/user.service';
import { uploadFile, sendMessage } from '../utils/communication';
import { IncomingForm } from 'formidable';
import stripePackage from 'stripe';

const stripe = stripePackage(
  'sk_test_51P8xunAXRJIuR1EYe7J4JcL6NNzstUm2qEcYlXEGJ3znZaEaP5pOQoYz7HqZu7GaWwAlNS6LfzPbUZl8FcGVNlFc00gDz5s3h4'
);

export const getMeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('getAllUsersHandler api');
    const users = await findAllUsers();
    return res.status(200).json({
      status: 'success',
      result: users.length,
      data: {
        users,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('getUserHandler api');
    const userId = req.query._id || res.locals.user._id.toString();
    const user = await findUserById(userId);
    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('updateProfileHandler api ');
    // Assuming req.body contains the fields to be updated
    if (!req.body._id) {
      req.body._id = res.locals.user._id.toString();
    }
    const { _id, ...updateFields } = req.body;

    // Construct the update object dynamically
    const updateObject: Record<string, any> = {};
    for (const key in updateFields) {
      if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
        updateObject[key] = updateFields[key];
      }
    }

    const user = await updateUser(updateObject, _id);

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const handleFileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('handleFileUpload Api');
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form' });
      }

      if (
        typeof fields !== 'object' ||
        Object.keys(fields).length === 0 ||
        Object.keys(files).length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: 'Must Give Type or File is not an image',
        });
      }

      const url = await uploadFile(files.file[0]);
      if (!url) {
        return res.status(404).json({
          success: false,
          message: 'Error uploading file',
        });
      }
      if (fields.type[0] === 1) {
        const user = await updateUser(
          { profilepic: url },
          res.locals.user._id.toString()
        );
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User Not Valid',
          });
        }
      } else if (fields.type[0] == 2) {
        const user = await updateUser(
          { logo: url },
          res.locals.user._id.toString()
        );
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User Not Valid',
          });
        }
      }

      return res.status(200).json({ message: 'File uploaded successfully' });
    });
  } catch (err: any) {
    next(err);
  }
};

export const handleSendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('handleSendMessage Api');

    const url = await sendMessage(req.body.to, req.body.message);
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Error sending message',
      });
    }
    return res.status(200).json({ message: 'Message Send successfully' });
  } catch (err: any) {
    next(err);
  }
};

export const handleStripeCheckOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [customer_email] - lets you prefill the email input in the form
    // [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    const user = res.locals.user || '6627596f58c1d9023ea5156a';
    const priceId = req.query.priceId || 'price_1P905kAXRJIuR1EYR1tYFQM4';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5000/api/users/stripePaymentSuccess?session_id={CHECKOUT_SESSION_ID}&&user_id=${
        user._id || user
      }`,
      cancel_url: `http://localhost:5000/api/users/stripePaymentCanceled`,
      customer_email: user.email,
    });

    return res.redirect(303, session.url);
    // return res.status(200).json({ message: 'Message Send successfully' });
  } catch (err: any) {
    next(err);
  }
};

export const handleStripeCheckOutSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('success: ', req.query);
    const { user_id, email } = req.query;
    const user = await updateUser({ isSubscribe: true }, user_id);
    console.log('user: ', user);
    // here user will redirect to frontend Sucessfull page
    return res.send({
      success: 'true',
      data: {
        user,
      },
    });
    // return res.status(200).json({ message: 'Message Send successfully' });
  } catch (err: any) {
    next(err);
  }
};

export const handleStripeCheckOutCanceled = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('success: ', req.query);
    const { user_id, email } = req.query;
    const user = await updateUser({ isSubscribe: false }, user_id);
    console.log('user: ', user);
    // here user will redirect to frontend Error  page
    return res.send({
      success: 'true',
      data: {
        user,
      },
    });
    // return res.status(200).json({ message: 'Message Send successfully' });
  } catch (err: any) {
    next(err);
  }
};

export const subscriptionDetailhandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('subscriptionDetailhandler api');
    const users = await findAllUsers();
    const data = await groupSubscriptionsByMonth(users);
    return res.status(200).json({
      status: 'success',
      result: users.length,
      data,
    });
  } catch (err: any) {
    next(err);
  }
};

function groupSubscriptionsByMonth(users) {
  const monthlyCounts = {};
  let monthlyCount = 0;
  let annualCount = 0;

  users.forEach(user => {
    // if (user.isSubscribe) {
    const date = new Date(user.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const monthYearKey = `${year}-${month.toString().padStart(2, '0')}`; // Format as "YYYY-MM"

    if (!monthlyCounts[monthYearKey]) {
      monthlyCounts[monthYearKey] = 0;
    }

    monthlyCounts[monthYearKey]++;

    if (user.subscriptionType === 1) {
      monthlyCount++;
    } else if (user.subscriptionType === 2) {
      annualCount++;
    }
    // }
  });
  monthlyCounts.totalMonthlySubscriber = monthlyCount;
  monthlyCounts.totalAnnualSubscriber = annualCount;

  return monthlyCounts;
}
