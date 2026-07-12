import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PricingConfig from "@/lib/models/PricingConfig";

const DEFAULT_PRICING = {
  basePrice: 49,
  tiers: [
    { minQty: 10, maxQty: 49, pricePerUnit: 39, label: "Team Discount" },
    { minQty: 50, maxQty: null, pricePerUnit: 29, label: "Bulk Discount" },
  ],
  premiumFabricAddon: 10,
  zipperAddon: 5,
  discountMessages: {
    tier1Message: "Add {remaining} more for team discount.",
    tier2Message: "Team discount! Add {remaining} more for bulk rate.",
    tier3Message: "🎉 Bulk discount applied!",
  },
};

export async function GET() {
  try {
    await dbConnect();
    const config = await PricingConfig.findOne({ isActive: true }).sort({ updatedAt: -1 });

    // Return DB config or fall back to hardcoded defaults
    return NextResponse.json({
      success: true,
      pricing: config || DEFAULT_PRICING,
    });
  } catch (error) {
    // On any DB error, return defaults so the site still works
    return NextResponse.json({ success: true, pricing: DEFAULT_PRICING });
  }
}
