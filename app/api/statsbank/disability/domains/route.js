// app/api/statsbank/disability/domains/route.js
import { NextResponse } from "next/server";
import { getDisabilityDomainComparison } from "@/app/lib/statsbank";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area") || "Ghana";
    const sex = searchParams.get("sex") || "all";
    const ageGroup = searchParams.get("ageGroup") || "all";
    const data = await getDisabilityDomainComparison(area, sex, ageGroup);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching disability domain comparison:", err);
    return NextResponse.json(
      { error: "Failed to fetch domain comparison" },
      { status: 500 }
    );
  }
}
