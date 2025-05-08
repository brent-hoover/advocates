import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // First, clear existing data to prevent duplicates
    await db.execute(sql`TRUNCATE TABLE ${advocates}`);
    
    // Then insert fresh data
    const records = await db.insert(advocates).values(advocateData).returning();
    
    return Response.json({ 
      success: true, 
      message: "Database successfully seeded",
      count: records.length,
      advocates: records 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ 
      success: false, 
      error: "Failed to seed database" 
    }, { status: 500 });
  }
}