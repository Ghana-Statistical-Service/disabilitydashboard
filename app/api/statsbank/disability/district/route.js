// app/api/statsbank/disability/district/route.js
import { NextResponse } from "next/server";
import { getDisabilityDistrictSummary } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityDistrictSummary(
      indicator,
      sex,
      ageGroup
    );
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability districts:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch disability data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
