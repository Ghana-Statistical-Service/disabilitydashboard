// app/api/statsbank/disability/education/route.js
import { NextResponse } from "next/server";
import { getDisabilityEducationStatusNational } from "@/app/lib/statsbank";

export async function GET() {
  try {
    const data = await getDisabilityEducationStatusNational();
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
