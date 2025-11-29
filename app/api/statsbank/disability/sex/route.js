// app/api/statsbank/disability/sex/route.js
import { NextResponse } from "next/server";
import { getDisabilitySexDistributionNational } from "@/app/lib/statsbank";

export async function GET() {
  try {
    const data = await getDisabilitySexDistributionNational();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability sex distribution:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch sex distribution" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
