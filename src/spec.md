# Specification

## Summary
**Goal:** Show a Barobo, Caraga weather forecast on the Home page directly below the Philippine Standard Time display.

**Planned changes:**
- Add a weather forecast block to `frontend/src/pages/HomePage.tsx` positioned immediately under the `<PhilippineTimeClock />` area, with the location label “Barobo, Caraga”.
- Fetch forecast data client-side using React Query, ensuring the Home page renders without waiting for the request.
- Implement clear loading and error states for the weather block.
- Display a concise weather view including current conditions and at least a 3-day forecast (day/date plus high/low and condition).

**User-visible outcome:** Visitors to the Home page see “Barobo, Caraga” weather immediately beneath the Philippine Standard Time, with current conditions and a multi-day forecast, including visible loading and error states when applicable.
