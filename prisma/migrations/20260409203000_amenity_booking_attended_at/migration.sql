-- Amenity utilization: attended / booked (kiosk check-in sets attendedAt)
ALTER TABLE "AmenityBooking" ADD COLUMN "attendedAt" DATETIME;
