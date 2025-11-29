// app/api/disability/regions/route.js
import { NextResponse } from "next/server";
import { getDisabilityRegionSummary} from "@/app/lib/statsbank";


export async function GET() {
  try {
    const data = await getDisabilityRegionSummary();
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


