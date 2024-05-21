import { omit } from 'lodash';
import { FilterQuery, QueryOptions } from 'mongoose';
import config from 'config';
import { excludedFields } from '../controllers/listing.controller';
import { signJwt } from '../utils/jwt';
import redisClient from '../utils/connectRedis';
import { DocumentType } from '@typegoose/typegoose';
import bcrypt from 'bcrypt';
import listingModel, { Listing } from '../models/listing.model';

export const createListing = async (input: Partial<Listing>) => {
  const listing = await listingModel.create(input);
  return omit(listing.toJSON(), excludedFields);
};

export const updateListing = async (updateObject: object, _id: string) => {
  const listing = await listingModel.findOneAndUpdate(
    { _id: _id },
    { $set: updateObject },
    { new: true }
  );
  return omit(listing.toJSON(), excludedFields);
};

export const deleteListing = async (_id: string) => {
  const listing = await listingModel.findOneAndUpdate(
    { _id },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return omit(listing.toJSON(), excludedFields);
};

export const getListing = async (
  type: string,
  userId: string,
  isDeleted: boolean
) => {
  return await listingModel.find({ userId, type, isDeleted });
};
