// app/api/disability/region/route.js
import { NextResponse } from "next/server";
import { getDisabilityRegionAndNationalSummary } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const { regions, national } =
      await getDisabilityRegionAndNationalSummary(indicator, sex, ageGroup);
    return NextResponse.json({ data: regions, national });
  } catch (err) {
    console.error("Error fetching disability regions:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch disability data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
