import { NextRequest, NextResponse } from "next/server";
import { esClient } from "@/lib/elasticsearch";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await esClient.search({
      index: "order_filters", 
      body,
    });

    return NextResponse.json({ hits: result.hits.hits});
  } catch (err: any) {
    console.error("ES query failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}