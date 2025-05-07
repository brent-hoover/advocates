import db from "../../../db";
import { advocates } from "../../../db/schema";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "5");
  
  // Calculate offset for pagination
  const offset = page * pageSize;
  
  // Get paginated data
  const data = await db.select()
    .from(advocates)
    .limit(pageSize)
    .offset(offset);
  
  // Get total count for pagination metadata
  const countResult = await db.select({ 
    count: sql<number>`count(*)`.mapWith(Number) 
  })
  .from(advocates);
  
  const totalCount = countResult[0].count;
  
  return Response.json({ 
    data,
    pagination: {
      total: totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize)
    }
  });
}
