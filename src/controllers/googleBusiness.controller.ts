import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/api/lisitng/oauth2callback'; //process.env.REDIRECT_URI;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function getNewTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

export async function refreshAccessToken() {
  try {
    const { token } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(token);
    return token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
}

export default oauth2Client;
////////////////////////////////////////////////////////////////////////
export async function fetchReviews(accountId: string, locationId: string) {
  const mybusiness = google.mybusiness({ version: 'v4', auth: oauth2Client });
  try {
    const response = await mybusiness.accounts.locations.reviews.list({
      parent: `accounts/${accountId}/locations/${locationId}`,
    });
    return response.data;
  } catch (error) {
    if (error.code === 401) {
      throw new Error('Token expired');
    }
    throw error;
  }
}
/////////////////////////////////////////////////////////////
import { NextFunction, Request, Response } from 'express';

export const authMethod = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('authMethod');
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/business.manage'],
    });
    res.redirect(url);
  } catch (err: any) {
    next(err);
  }
};

export const oauth2callback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('oauth2callback');
    const { code } = req.query as { code: string };
    try {
      const tokens = await getNewTokens(code);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  } catch (err: any) {
    next(err);
  }
};

export const fetchReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('fetchReviewsHandler');

    const { accountId, locationId } = req.params;
    try {
      const reviews = await fetchReviews(accountId, locationId);
      // res.json(reviews);
      res.status(200).json({
        status: 'success',
        data: {
          reviews,
        },
      });
    } catch (error) {
      if (error.message === 'Token expired') {
        await refreshAccessToken();
        const reviews = await fetchReviews(accountId, locationId);
        // res.json(reviews);
        res.status(200).json({
          status: 'success',
          data: {
            reviews,
          },
        });
      } else {
        res.status(500).send(`Failed to fetch reviews: ${error.message}`);
      }
    }
  } catch (err: any) {
    next(err);
  }
};
