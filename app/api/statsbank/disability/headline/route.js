// app/api/statsbank/disability/headline/route.js
import { NextResponse } from "next/server";
import { getDisabilityHeadline } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityHeadline(indicator, sex, ageGroup);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability headline figures:", err);
    return NextResponse.json(
      { error: "Failed to fetch headline figures" },
      { status: 500 }
    );
  }
}
