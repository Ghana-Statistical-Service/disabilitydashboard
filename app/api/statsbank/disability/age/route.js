// app/api/statsbank/disability/age/route.js
import { NextResponse } from "next/server";
import { getDisabilityAgeDistribution } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area") || "Ghana";
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityAgeDistribution(
      area,
      indicator,
      sex,
      ageGroup
    );
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
