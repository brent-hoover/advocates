import { NextRequest } from "next/server";
import { advocateData } from "../../../db/seed/advocates";

export async function GET(request: NextRequest) {
  try {
    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
    const city = searchParams.get("city") || "";
    const specialty = searchParams.get("specialty") || "";
    
    // Start with all data
    let filteredData = advocateData;
    
    // Apply city filter if provided
    if (city) {
      filteredData = filteredData.filter(advocate => 
        advocate.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Apply specialty filter if provided
    if (specialty) {
      filteredData = filteredData.filter(advocate => 
        advocate.specialties.some(s => 
          s.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }
    
    // Calculate pagination values
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return Response.json({ 
      data: paginatedData,
      pagination: {
        total: filteredData.length,
        page,
        pageSize,
        pageCount: Math.ceil(filteredData.length / pageSize)
      }
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ 
      error: "Failed to fetch advocates",
      data: [],
      pagination: { total: 0, page: 0, pageSize: 0, pageCount: 0 }
    }, { status: 500 });
  }
}
