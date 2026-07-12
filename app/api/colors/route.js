import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Color from "@/lib/models/Color";

export async function GET() {
  try {
    await dbConnect();
    const colors = await Color.find({ isActive: true }).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, colors });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
