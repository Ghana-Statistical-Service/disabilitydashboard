// app/api/statsbank/disability/age/route.js
import { NextResponse } from "next/server";
import { getDisabilityAgeDistributionNational } from "@/app/lib/statsbank";

export async function GET() {
  try {
    const data = await getDisabilityAgeDistributionNational();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability age distribution:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch age distribution" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
