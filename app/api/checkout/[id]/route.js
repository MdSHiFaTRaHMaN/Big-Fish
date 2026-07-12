import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Design from "@/lib/models/Design";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const design = await Design.findById(id);
    if (!design) {
      return NextResponse.json(
        { success: false, message: "Design not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, design });
  } catch (error) {
    console.error("Fetch Design Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
