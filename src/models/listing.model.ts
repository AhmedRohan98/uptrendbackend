import {
  DocumentType,
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
  Ref,
} from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    // Add createdAt and updatedAt fields
    timestamps: true,
  },
})

// Export the Listing class to be used as TypeScript type
export class Listing {
  // @prop()
  // colorScheme: string;

  // @prop()
  // brandLogo: string;
  @prop({ required: true })
  userId: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, validate: /\b(?:1|2)\b/ })
  type: number;
  // 1- Google
  // 2- Yelp

  @prop()
  email: string;

  @prop()
  phoneno: string;

  @prop()
  branch: string;

  @prop()
  place_id: string;

  @prop()
  city: string;

  @prop()
  country: string;

  @prop({ default: false })
  isDeleted: boolean;
}

// Create the listing model from the Listing class
const listingModel = getModelForClass(Listing);
export default listingModel;
