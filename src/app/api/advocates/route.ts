import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

// Define the Advocate type
type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: Date | null;
};

export async function GET(request: NextRequest) {
  try {
    // Parse parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
    const city = searchParams.get("city") || "";
    const specialty = searchParams.get("specialty") || "";
    const searchTerm = searchParams.get("search") || "";
    
    // Get data from database
    let filteredData: Advocate[] = [];
    
    try {
      const dbAdvocates = await db.select().from(advocates);
      
      // Ensure specialties is properly cast as string[]
      filteredData = dbAdvocates.map(advocate => ({
        ...advocate,
        specialties: advocate.specialties as unknown as string[]
      }));
    } catch (error) {
      console.error("Error fetching from database:", error);
      return Response.json({ 
        error: "Failed to connect to database",
        data: [],
        pagination: { total: 0, page: 0, pageSize: 0, pageCount: 0 }
      }, { status: 500 });
    }
    
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
    
    // Apply search term if provided
    if (searchTerm) {
      filteredData = filteredData.filter(advocate => {
        const term = searchTerm.toLowerCase();
        return (
          advocate.firstName.toLowerCase().includes(term) ||
          advocate.lastName.toLowerCase().includes(term) ||
          advocate.city.toLowerCase().includes(term) ||
          advocate.degree.toLowerCase().includes(term) ||
          advocate.specialties.some(s => s.toLowerCase().includes(term)) ||
          String(advocate.yearsOfExperience).includes(term)
        );
      });
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
