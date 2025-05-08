export async function GET() {
  return Response.json({ 
    message: "Test endpoint working",
    testData: [
      { id: 1, name: "Test 1" },
      { id: 2, name: "Test 2" }
    ]
  });
}