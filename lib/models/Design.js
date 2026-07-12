import mongoose from "mongoose";

const DesignSchema = new mongoose.Schema(
  {
    quinckId: {
      type: String,
      required: false,
    },
    ForntSideImage: {
      type: String,
      required: true,
    },
    BackSideImage: {
      type: String,
      required: true,
    },
    CustomText: {
      type: String,
      default: "",
    },
    Quintity: {
      type: Number,
      default: 1,
    },
    ShopifyBaseUrl: {
      type: String,
      required: false,
    },
    PdfLink: {
      type: String,
      required: true,
    },
    GlbLink: {
      type: String,
      required: false,
    },
    designState: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Design = mongoose.models.Design || mongoose.model("Design", DesignSchema);

export default Design;
