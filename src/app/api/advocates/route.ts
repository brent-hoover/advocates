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
  
  // Get all data from the database
  const allData = await db.select().from(advocates);
  
  // Handle pagination manually to avoid TypeScript errors with the ORM
  const data = allData.slice(offset, offset + pageSize);
  
  // Get total count for pagination metadata
  const totalCount = allData.length;
  
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
