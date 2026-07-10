import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/mongodb";
import Design from "@/lib/models/Design";
import { promises as fs } from "fs";
import path from "path";

// Initialize Cloudinary if credentials are available
const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Helper to upload a file to Cloudinary or fall back to local disk
async function uploadFile(file, folderName, resourceType = "image") {
  if (!file) return "";

  const ext = file.name.split(".").pop() || "bin";
  const baseName = `${folderName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  // For raw (PDF), keep extension in filename; for image, extension handled by Cloudinary
  const filename = `${baseName}.${ext}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // 1. If Cloudinary is configured, upload to Cloudinary
  if (hasCloudinaryConfig) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: `tshirt-designs/${folderName}`,
          resource_type: resourceType,
          type: "upload",
        };

        // For raw resource type (PDFs), include the extension in the public_id
        // so Cloudinary stores and serves the file with the correct .pdf extension.
        // For image resource type, omit extension — Cloudinary handles it automatically.
        if (resourceType === "raw") {
          uploadOptions.public_id = filename;         // e.g. "summary-172345.pdf"
        } else {
          uploadOptions.public_id = baseName;          // e.g. "front-172345" (no ext)
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            console.log("Cloudinary Result:", result);

            if (error) {
              console.error(error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(fileBuffer);
      });
    } catch (err) {
      console.error("Cloudinary Upload failed, falling back to local storage:", err);
    }
  }

  // 2. Fallback: Save to public directory locally (highly useful for development/testing)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "designs");
    await fs.mkdir(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, filename);
    await fs.writeFile(localPath, fileBuffer);

    // Return local relative URL
    return `/uploads/designs/${filename}`;
  } catch (err) {
    console.error("Local file save failed:", err);
    throw new Error("Failed to store file on Cloudinary or locally.");
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const quinckId = formData.get("quinckId") || "";
    const FrontSideImage = formData.get("ForntSideImage");
    const BackSideImage = formData.get("BackSideImage");
    const CustomText = formData.get("CustomText") || "";
    const Quantity = parseInt(formData.get("Quintity")) || 1;
    const ShopifyBaseUrl = formData.get("ShopifyBaseUrl") || "";
    const PdfFile = formData.get("PdfLink");

    if (!FrontSideImage || !BackSideImage || !PdfFile) {
      return NextResponse.json(
        { error: "Missing required files (ForntSideImage, BackSideImage, or PdfLink)" },
        { status: 400 }
      );
    }

    // Upload files to Cloudinary (or local fallback)
    // Images (PNG) → resource_type: "image"
    // PDF          → resource_type: "raw"  (preserves .pdf extension in Cloudinary URL)
    const frontUrl = await uploadFile(FrontSideImage, "front", "image");
    const backUrl = await uploadFile(BackSideImage, "back", "image");
    const pdfUrl = await uploadFile(PdfFile, "summary", "raw");

    // Save design to MongoDB
    const newDesign = new Design({
      quinckId,
      ForntSideImage: frontUrl,
      BackSideImage: backUrl,
      CustomText,
      Quintity: Quantity,
      ShopifyBaseUrl,
      PdfLink: pdfUrl,
    });

    await newDesign.save();

    // Respond with the exact format requested (including MongoDB _id)
    return NextResponse.json({
      _id: newDesign._id,
      quinckId: newDesign.quinckId,
      ForntSideImage: newDesign.ForntSideImage,
      BackSideImage: newDesign.BackSideImage,
      CustomText: newDesign.CustomText,
      Quintity: newDesign.Quintity,
      ShopifyBaseUrl: newDesign.ShopifyBaseUrl,
      PdfLink: newDesign.PdfLink,
    });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
