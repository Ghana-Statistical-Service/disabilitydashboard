// app/api/disability/region/route.js
import { NextResponse } from "next/server";
import { getDisabilityRegionSummary } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityRegionSummary(indicator, sex, ageGroup);
    return NextResponse.json({ data });
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
