// app/api/statsbank/disability/education/route.js
import { NextResponse } from "next/server";
import { getDisabilityEducationStatus } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area") || "Ghana";
    const indicator = searchParams.get("indicator") || "disability";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityEducationStatus(
      area,
      indicator,
      sex,
      ageGroup
    );
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability education status:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch education status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
