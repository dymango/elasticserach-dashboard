import { NextRequest, NextResponse } from "next/server";
import { esClient } from "@/lib/elasticsearch";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body)
    const { indexName, ...queryBody } = body;

    const result = await esClient.search({
      index: indexName, 
      body: queryBody,
    });

    return NextResponse.json({ search_result: result.hits});
  } catch (err: any) {
    console.error("ES query failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const indices = await esClient.cat.indices({
      format: "json",
    });

    console.log(indices)
    const indexNames = indices.map((i: any) => i.index);

    return NextResponse.json({ indices: indexNames });
  } catch (err: any) {
    console.error("Failed to fetch indices:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}