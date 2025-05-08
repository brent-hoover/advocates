import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { NextRequest } from 'next/server';
import supertest from 'supertest';
import { GET } from '../../../src/app/api/advocates/route';

// Helper to convert NextRequest to standard HTTP request
const createNextRequest = (path: string, queryParams: Record<string, string> = {}) => {
  const url = new URL(`http://localhost${path}`);
  
  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return new NextRequest(url);
};

// Helper to create a supertest request handler
const createTestHandler = (req: NextRequest) => {
  return async () => {
    const res = await GET(req);
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: await res.json(),
    };
  };
};

describe('Advocates API', () => {
  let knownFirstName: string;
  let knownLastName: string;
  let knownCity: string;
  let knownSpecialty: string;

  // Fetch initial data to use in our search tests
  beforeAll(async () => {
    const req = createNextRequest('/api/advocates');
    const handler = createTestHandler(req);
    const response = await handler();
    
    if (response.body.data && response.body.data.length > 0) {
      const firstAdvocate = response.body.data[0];
      knownFirstName = firstAdvocate.firstName;
      knownLastName = firstAdvocate.lastName;
      knownCity = firstAdvocate.city;
      knownSpecialty = firstAdvocate.specialties[0];
    }
  });

  it('should return a list of advocates', async () => {
    const req = createNextRequest('/api/advocates');
    const handler = createTestHandler(req);
    
    const response = await handler();
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toHaveProperty('pagination');
  });

  it('should return advocates with correct structure', async () => {
    const req = createNextRequest('/api/advocates');
    const handler = createTestHandler(req);
    
    const response = await handler();
    
    // Check that we have data
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Check structure of the first advocate
    const advocate = response.body.data[0];
    expect(advocate).toHaveProperty('id'); // Database advocates will have an ID
    expect(advocate).toHaveProperty('firstName');
    expect(advocate).toHaveProperty('lastName');
    expect(advocate).toHaveProperty('city');
    expect(advocate).toHaveProperty('degree');
    expect(advocate).toHaveProperty('specialties');
    expect(advocate).toHaveProperty('yearsOfExperience');
    expect(advocate).toHaveProperty('phoneNumber');
    expect(advocate).toHaveProperty('createdAt'); // Database advocates will have a createdAt timestamp
    
    // Check that specialties is an array
    expect(Array.isArray(advocate.specialties)).toBe(true);
  });

  it('should return default pagination values', async () => {
    const req = createNextRequest('/api/advocates');
    const handler = createTestHandler(req);
    
    const response = await handler();
    
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('page', 0);
    expect(response.body.pagination).toHaveProperty('pageSize', 5);
    expect(response.body.pagination).toHaveProperty('pageCount');
    
    // Verify data length matches pageSize
    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });

  describe('Pagination functionality', () => {
    it('should respect page parameter', async () => {
      // Get first page as reference
      const page0Req = createNextRequest('/api/advocates', { page: '0', pageSize: '3' });
      const page0Handler = createTestHandler(page0Req);
      const page0Response = await page0Handler();
      
      // Get second page
      const page1Req = createNextRequest('/api/advocates', { page: '1', pageSize: '3' });
      const page1Handler = createTestHandler(page1Req);
      const page1Response = await page1Handler();
      
      // Ensure we got different data sets
      expect(page0Response.body.data.length).toBeGreaterThan(0);
      expect(page1Response.body.data.length).toBeGreaterThan(0);
      
      // Check if the first item on second page is different from first page
      if (page0Response.body.data.length > 0 && page1Response.body.data.length > 0) {
        const firstItemPage0 = page0Response.body.data[0];
        const firstItemPage1 = page1Response.body.data[0];
        
        // Items should be different - comparing IDs if available, or first+last name
        if (firstItemPage0.id && firstItemPage1.id) {
          expect(firstItemPage0.id).not.toBe(firstItemPage1.id);
        } else {
          expect(`${firstItemPage0.firstName} ${firstItemPage0.lastName}`)
            .not.toBe(`${firstItemPage1.firstName} ${firstItemPage1.lastName}`);
        }
      }
      
      // Check pagination metadata
      expect(page0Response.body.pagination.page).toBe(0);
      expect(page1Response.body.pagination.page).toBe(1);
    });
    
    it('should respect pageSize parameter', async () => {
      // Get responses with different page sizes
      const size3Req = createNextRequest('/api/advocates', { pageSize: '3' });
      const size3Handler = createTestHandler(size3Req);
      const size3Response = await size3Handler();
      
      const size5Req = createNextRequest('/api/advocates', { pageSize: '5' });
      const size5Handler = createTestHandler(size5Req);
      const size5Response = await size5Handler();
      
      const size10Req = createNextRequest('/api/advocates', { pageSize: '10' });
      const size10Handler = createTestHandler(size10Req);
      const size10Response = await size10Handler();
      
      // Check that we get the right number of items for each page size
      expect(size3Response.body.data.length).toBeLessThanOrEqual(3);
      expect(size5Response.body.data.length).toBeLessThanOrEqual(5);
      expect(size10Response.body.data.length).toBeLessThanOrEqual(10);
      
      // Check pagination metadata
      expect(size3Response.body.pagination.pageSize).toBe(3);
      expect(size5Response.body.pagination.pageSize).toBe(5);
      expect(size10Response.body.pagination.pageSize).toBe(10);
      
      // Check that the total count remains the same across different page sizes
      expect(size3Response.body.pagination.total).toBe(size5Response.body.pagination.total);
      expect(size5Response.body.pagination.total).toBe(size10Response.body.pagination.total);
    });
    
    it('should calculate page count correctly', async () => {
      const response = await (createTestHandler(createNextRequest('/api/advocates')))();
      
      const { total, pageSize, pageCount } = response.body.pagination;
      
      // Calculate expected page count based on total and pageSize
      const expectedPageCount = Math.ceil(total / pageSize);
      
      expect(pageCount).toBe(expectedPageCount);
    });
    
    it('should return the last page with remaining items', async () => {
      const firstResponse = await (createTestHandler(createNextRequest('/api/advocates')))();
      const { total, pageCount } = firstResponse.body.pagination;
      
      // Skip test if there's only one page
      if (pageCount <= 1) {
        console.log('Skipping last page test as there is only one page of data');
        return;
      }
      
      // Get the last page
      const lastPageIndex = pageCount - 1;
      const lastPageReq = createNextRequest('/api/advocates', { page: lastPageIndex.toString() });
      const lastPageResponse = await (createTestHandler(lastPageReq))();
      
      // Check that the last page has the correct number of items
      const expectedItemsCount = total % 5 || 5; // If divisible by 5, last page has 5 items, otherwise the remainder
      
      expect(lastPageResponse.body.data.length).toBe(expectedItemsCount);
      expect(lastPageResponse.body.pagination.page).toBe(lastPageIndex);
    });
    
    it('should return empty array for page beyond available data', async () => {
      const firstResponse = await (createTestHandler(createNextRequest('/api/advocates')))();
      const { pageCount } = firstResponse.body.pagination;
      
      // Request a page beyond the available data
      const beyondPageReq = createNextRequest('/api/advocates', { page: (pageCount + 5).toString() });
      const beyondPageResponse = await (createTestHandler(beyondPageReq))();
      
      expect(beyondPageResponse.body.data.length).toBe(0);
      expect(beyondPageResponse.body.pagination.page).toBe(pageCount + 5);
    });
  });

  describe('Search functionality', () => {
    it('should filter advocates by text search', async () => {
      // Skip if we don't have valid test data
      if (!knownFirstName) {
        console.warn('Skipping search test because no test data is available');
        return;
      }

      const req = createNextRequest('/api/advocates', { search: knownFirstName });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All returned advocates should include the search term in some field
      response.body.data.forEach((advocate: any) => {
        const hasMatch = 
          advocate.firstName.toLowerCase().includes(knownFirstName.toLowerCase()) ||
          advocate.lastName.toLowerCase().includes(knownFirstName.toLowerCase()) ||
          advocate.city.toLowerCase().includes(knownFirstName.toLowerCase()) ||
          advocate.degree.toLowerCase().includes(knownFirstName.toLowerCase()) ||
          advocate.specialties.some((s: string) => s.toLowerCase().includes(knownFirstName.toLowerCase())) ||
          String(advocate.yearsOfExperience).includes(knownFirstName);
          
        expect(hasMatch).toBe(true);
      });
    });

    it('should filter advocates by first name', async () => {
      if (!knownFirstName) return;

      const req = createNextRequest('/api/advocates', { search: knownFirstName });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].firstName).toBe(knownFirstName);
    });

    it('should filter advocates by last name', async () => {
      if (!knownLastName) return;

      const req = createNextRequest('/api/advocates', { search: knownLastName });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].lastName).toBe(knownLastName);
    });

    it('should return empty array for non-existent search term', async () => {
      const req = createNextRequest('/api/advocates', { search: 'thisNameShouldNotExistInTheDatabase12345' });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('City filtering', () => {
    it('should filter advocates by city', async () => {
      if (!knownCity) {
        console.warn('Skipping city filter test because no city data is available');
        return;
      }

      const req = createNextRequest('/api/advocates', { city: knownCity });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All returned advocates should be from the specified city
      response.body.data.forEach((advocate: any) => {
        expect(advocate.city).toBe(knownCity);
      });
    });

    it('should find advocates with partial city match', async () => {
      if (!knownCity || knownCity.length < 3) return;
      
      // Use just the first 3 characters of the city name for a partial match
      const partialCity = knownCity.substring(0, 3);
      
      const req = createNextRequest('/api/advocates', { city: partialCity });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All returned advocates should have cities that include the partial match
      response.body.data.forEach((advocate: any) => {
        expect(advocate.city.toLowerCase()).toContain(partialCity.toLowerCase());
      });
    });

    it('should return empty array for non-existent city', async () => {
      const req = createNextRequest('/api/advocates', { city: 'NonExistentCityXYZ123' });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Specialty filtering', () => {
    it('should filter advocates by specialty', async () => {
      if (!knownSpecialty) {
        console.warn('Skipping specialty filter test because no specialty data is available');
        return;
      }

      const req = createNextRequest('/api/advocates', { specialty: knownSpecialty });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All returned advocates should have the specified specialty
      response.body.data.forEach((advocate: any) => {
        const hasSpecialty = advocate.specialties.some(
          (s: string) => s.toLowerCase() === knownSpecialty.toLowerCase()
        );
        expect(hasSpecialty).toBe(true);
      });
    });

    it('should find advocates with partial specialty match', async () => {
      if (!knownSpecialty || knownSpecialty.length < 5) return;
      
      // Use a substring of the specialty for a partial match
      const partialSpecialty = knownSpecialty.substring(0, 5);
      
      const req = createNextRequest('/api/advocates', { specialty: partialSpecialty });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // All returned advocates should have at least one specialty that includes the partial match
      response.body.data.forEach((advocate: any) => {
        const hasPartialMatch = advocate.specialties.some(
          (s: string) => s.toLowerCase().includes(partialSpecialty.toLowerCase())
        );
        expect(hasPartialMatch).toBe(true);
      });
    });

    it('should return empty array for non-existent specialty', async () => {
      const req = createNextRequest('/api/advocates', { specialty: 'NonExistentSpecialtyXYZ123' });
      const handler = createTestHandler(req);
      
      const response = await handler();
      
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });
});