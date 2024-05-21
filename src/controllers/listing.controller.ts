import { NextFunction, Request, Response } from 'express';
import {
  CreateLisitngInput,
  UpdateLisitngInput,
} from '../schema/listing.schema';
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
} from '../services/listing.service';
import listingModel, { Listing } from '../models/listing.model';
import axios from 'axios';
import { getJson } from 'serpapi';

export const excludedFields = [];

export const getMeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
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

export const createListingHandler = async (
  req: Request<{}, {}, CreateLisitngInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('createListingHandler api ');
    // console.log('res.locals.user', res.locals.user);
    if (!req.body.userId) {
      req.body.userId = res.locals.user._id.toString();
    }
    const listing = await createListing(req.body);

    return res.status(201).json({
      status: 'success',
      data: {
        listing,
      },
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Not saved',
      });
    }
    next(err);
  }
};

export const getListingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('getListingHandler api ');

    if (!req.query.userId) {
      req.query.userId = res.locals.user._id.toString();
    }
    if (!req.query.type) {
      return res.status(409).json({
        status: 'fail',
        message: 'Required type',
      });
    }

    const listing = await getListing(req.query.type, req.query.userId, false);
    return res.status(201).json({
      status: 'success',
      data: {
        listing,
      },
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Not saved',
      });
    }
    next(err);
  }
};

export const updateListingHandler = async (
  req: Request<{}, {}, UpdateLisitngInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('updateListingHandler api ');
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
    const listing = await updateListing(updateObject, _id);

    return res.status(201).json({
      status: 'success',
      data: {
        listing,
      },
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Not update',
      });
    }
    next(err);
  }
};

export const deleteListingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('deleteListingHandler api ');
    const listing = await deleteListing(req.query.id);

    console.log('listing: ', listing);

    return res.status(201).json({
      status: 'success',
      data: {
        listing,
      },
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Not saved',
      });
    }
    next(err);
  }
};

export const yelpSearchHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const baseUrl = 'https://api.yelp.com/v3/businesses/search';

    // Extract query parameters from the request
    const queryParams = req.query;

    const response = await axios.get(baseUrl, {
      headers: { Authorization: `Bearer ${process.env.YELP_ACCESS_KEY}` },
      params: queryParams,
    });
    return res.status(201).json({
      status: 'success',
      data: response.data,
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
      });
    }
    next(err);
  }
};
export const googleSearchHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const baseUrl =
      'https://maps.googleapis.com/maps/api/place/textsearch/json';

    // Extract query parameters from the request
    const queryParams = req.query;
    queryParams.key = process.env.GOOGLE_API_KEY;

    const response = await axios.get(baseUrl, {
      headers: { Accept: 'application/json' },
      params: queryParams,
    });
    console.log('paceid', response.data.results[0].place_id);
    return res.status(201).json({
      status: 'success',
      data: response.data,
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
      });
    }
    next(err);
  }
};
export const googleByPlaceIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';

    // Extract query parameters from the request
    const queryParams = req.query;
    queryParams.key = process.env.GOOGLE_API_KEY;

    const response = await axios.get(baseUrl, {
      headers: { Accept: 'application/json' },
      params: queryParams,
    });

    return res.status(201).json({
      status: 'success',
      reviews: response.data.result.reviews,
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
      });
    }
    next(err);
  }
};

export const yelpGetReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('yelpGetReviewHandler Api ');

    // Extract query parameters from the request
    const queryParams = req.query;
    const baseUrl = `https://api.yelp.com/v3/businesses/${req.query.business_id_or_alias}/reviews`;

    const response = await axios.get(baseUrl, {
      headers: { Authorization: `Bearer ${process.env.YELP_ACCESS_KEY}` },
      params: queryParams,
    });
    return res.status(201).json({
      status: 'success',
      data: response.data,
    });
  } catch (err: any) {
    console.log('err: ', err);

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
      });
    }
    next(err);
  }
};

export const serpapiGoogleReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = req.query;
    queryParams.api_key =
      process.env.SERPAPI_KEY ||
      '5ffbb5ac75a03419d2093ada6d1b7f6de75056c07369aa66cc6fa9140f4eab52';
    queryParams.hl = 'en';
    queryParams.engine = 'google_maps_reviews';
    const review = await getJson(queryParams);
    return res.status(200).json({
      status: 'success',
      next_page_token: review.serpapi_pagination.next_page_token,
      reviews: review.reviews,
    });
  } catch (error: any) {
    console.log('err: ', error);
    try {
      return res.status(400).json({
        status: 'fail',
        error: JSON.parse(error.toString().replace(/\n/g, '')),
      });
    } catch (error: any) {
      next(error);
    }
  }
};

export const serpapiGetGooglePlaceDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('serpapiGetPlaceDetailHandler');
    const queryParams = req.query;
    queryParams.api_key = process.env.SERPAPI_KEY;
    queryParams.hl = 'en';
    queryParams.type = 'place';
    queryParams.google_domain = 'google.com';
    queryParams.engine = 'google_maps';
    const place = await getJson(queryParams);
    return res.status(200).json({
      status: 'success',
      result: place.place_results,
    });
  } catch (error: any) {
    console.log('err: ', error);
    try {
      return res.status(400).json({
        status: 'fail',
        error: JSON.parse(error.toString().replace(/\n/g, '')),
      });
    } catch (error: any) {
      next(error);
    }
  }
};

export const serpapiYelpReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('serpapiYelpReviewHandler: ');

    const queryParams = req.query;
    queryParams.api_key = process.env.SERPAPI_KEY;
    queryParams.hl = 'en';
    queryParams.engine = 'yelp_reviews';
    if (queryParams.sortby) {
      if (queryParams.sortby == 'Yelp Sort') {
        queryParams.sortby = 'relevance_desc';
      } else if (queryParams.sortby == 'Newest First') {
        queryParams.sortby = 'date_desc';
      } else if (queryParams.sortby == 'Oldest Rated') {
        queryParams.sortby = 'date_asc';
      } else if (queryParams.sortby == 'Highest Rated') {
        queryParams.sortby = 'rating_desc';
      } else if (queryParams.sortby == 'Lowest Rated') {
        queryParams.sortby = 'rating_asc';
      } else if (queryParams.sortby == 'Elites') {
        queryParams.sortby = 'elites_desc';
      } else {
        queryParams.sortby = 'relevance_desc';
      }
    }

    const review = await getJson(queryParams);
    return res.status(200).json({
      status: 'success',
      reviews: review.reviews,
    });
  } catch (error: any) {
    console.log('err: ', error);
    try {
      return res.status(400).json({
        status: 'fail',
        error: JSON.parse(error.toString().replace(/\n/g, '')),
      });
    } catch (error: any) {
      next(error);
    }
  }
};

export const serpapiYelpPlaceDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('serpapiYelpPlaceDetailHandler ');

    const queryParams = req.query;
    queryParams.api_key = process.env.SERPAPI_KEY;
    queryParams.engine = 'yelp_place';
    const detail = await getJson(queryParams);
    if (detail.error) {
      return res.status(400).json({
        status: 'fail',
        error: detail.error,
      });
    }
    return res.status(200).json({
      status: 'success',
      result: detail.place_results,
    });
  } catch (error: any) {
    console.log('err: ', error);
    try {
      return res.status(400).json({
        status: 'fail',
        error: JSON.parse(error.toString().replace(/\n/g, '')),
      });
    } catch (error: any) {
      next(error);
    }
  }
};
