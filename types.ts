
import React from 'react';

export interface Destination {
  name: string;
  description: string;
  sustainabilityScore: number;
  learningOpportunities: string[];
  latitude: number;
  longitude: number;
  skill: string; // The skill this destination was recommended for
}

export interface Skill {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Feedback {
  rating: number;
  comment: string;
}

export interface ActivityDetail {
  time: string;
  activity: string;
  description: string;
  location: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  morning: ActivityDetail;
  afternoon: ActivityDetail;
  evening: ActivityDetail;
  dining: { breakfast: string; lunch: string; dinner: string };
  transit: string;
  phraseOfTheDay: { phrase: string; meaning: string };
  sustainabilityTip: string;
}

export interface FlightDetails {
  airline: string;
  route: string;
  estimatedPrice: string;
  bookingTip: string;
}

export interface HotelDetails {
  name: string;
  location: string;
  estimatedPricePerNight: string;
  description: string;
}

export interface DetailedPlan {
  country: string;
  hobbies: string[];
  summary: string;
  startDate: string;
  endDate: string;
  flightDetails: FlightDetails;
  hotelDetails: HotelDetails;
  itinerary: ItineraryDay[];
  estimatedBudget: string;
  bestTimeToVisit: string;
}

export interface Booking {
  bookingId: string;
  destination: Destination;
  name: string;
  email: string;
}

export interface SafetyAdvisory {
  locationName: string;
  latitude: number;
  longitude: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}
