import mongoose from 'mongoose';

const pageMetaSchema = new mongoose.Schema(
  {
    pageId: { type: String, unique: true, index: true },

    brand: { type: String },
    category: { type: String },
    subCategory: { type: String },

    costPerPostFrom: { type: Number },
    costPerPostTo: { type: Number },
    totalOfLike: { type: Number },
    totalOfFollow: { type: Number },

    dob: { type: Date },
    fullName: { type: String },
    gender: { type: String },
    location: { type: String },
    professional: { type: String },
    imageStyle: { type: String },
    tonality: { type: String },
    personality: { type: String },
    competitors: { type: String },
    creativeQuantity: { type: String },

    authenticity: { type: Number },
    audienceMastery: { type: Number },
    collaborative: { type: Number },
    collaborationProfessional: { type: Number },
    justifiableCost: { type: Number },
    longTermPartnership: { type: Number },

    totalFollower: { type: Number },
    activeFollower: { type: Number },
    realUser: { type: Number },

    audienceMale: { type: Number },
    audienceFemale: { type: Number },
    audienceHN: { type: Number },
    audienceHCM: { type: Number },
    audienceOther: { type: Number },

    rageAge: { type: String },

    totalPost: { type: Number },
    brandedPostPerTotalPost: { type: Number },
    avgEngagementBrandedPost: { type: Number },
    avgInteractionBrandedPost: { type: Number },
    avgBuzzBrandedPost: { type: Number },
    positiveSentimentBrandedPost: { type: Number },

    unbrandedPostPerTotalPost: { type: Number },
    avgEngagementUnbrandedPost: { type: Number },
    avgInteractionUnbrandedPost: { type: Number },
    avgBuzzUnbrandedPost: { type: Number },
    positiveSentimentUnbrandedPost: { type: Number },

    videoPostPerTotalPost: { type: Number },
    avgEngagementVideoPost: { type: Number },
    avgInteractionVideoPost: { type: Number },

    photoPostPerTotalPost: { type: Number },
    avgEngagementPhotoPost: { type: Number },
    avgInteractionPhotoPost: { type: Number },

    top10BrandedPost: { type: String },
    top10UnbrandedPost: { type: String },
    bottom10BrandedPost: { type: String },
    bottom10UnbrandedPost: { type: String },

    clients: { type: String },
    isBrand: { type: Boolean },
    workWithTPG: { type: String },
    PriceFrom: { type: mongoose.Schema.Types.Decimal128 },
    PriceTo: { type: mongoose.Schema.Types.Decimal128 },

    isActive: { type: Boolean }
  },
  {
    timestamps: true
  }
);

export const PageMeta = mongoose.model("PageMeta", pageMetaSchema);
