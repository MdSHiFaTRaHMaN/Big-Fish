import mongoose from "mongoose";

const PricingConfigSchema = new mongoose.Schema(
  {
    basePrice: { type: Number, required: true, default: 49 },
    tiers: [
      {
        minQty: { type: Number, required: true },
        maxQty: { type: Number, default: null },
        pricePerUnit: { type: Number, required: true },
        label: { type: String, default: "" },
      },
    ],
    premiumFabricAddon: { type: Number, default: 10 },
    zipperAddon: { type: Number, default: 5 },
    discountMessages: {
      tier1Message: { type: String, default: "Add {remaining} more for team discount." },
      tier2Message: { type: String, default: "Team discount! Add {remaining} more for bulk rate." },
      tier3Message: { type: String, default: "🎉 Bulk discount applied!" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PricingConfig ||
  mongoose.model("PricingConfig", PricingConfigSchema);
