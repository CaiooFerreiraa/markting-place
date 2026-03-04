import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    if (files.length > 8) {
      return NextResponse.json(
        { error: "Maximum 8 files allowed" },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public/uploads/products");
    const filePaths: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${uuidv4()}.webp`;
      const filePath = join(uploadDir, fileName);

      await sharp(buffer)
        .resize(1000, 1000, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 80 })
        .toFile(filePath);

      filePaths.push(`/uploads/products/${fileName}`);
    }

    return NextResponse.json({ filePaths });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    );
  }
}
