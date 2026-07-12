import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DesignShape from "@/lib/models/DesignShape";

export async function GET() {
  try {
    await dbConnect();
    const shapes = await DesignShape.find({ isActive: true })
      .sort({ createdAt: 1 })
      .select("id label svgElements");
    return NextResponse.json({ success: true, shapes });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
