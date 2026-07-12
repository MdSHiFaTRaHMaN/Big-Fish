import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pattern from "@/lib/models/Pattern";

export async function GET() {
  try {
    await dbConnect();
    const patterns = await Pattern.find({ isActive: true }).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, patterns });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
