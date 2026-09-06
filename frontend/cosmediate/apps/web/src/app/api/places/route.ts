import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const apiUrl =
      process.env.GOOGLE_PLACES_API_URL ||
      "https://places.googleapis.com/v1/places:searchText";
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

    if (!apiKey) {
      console.warn("Missing Google Places API key");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      apiUrl,
      {
        textQuery: query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
        },
      }
    );

    const places = response.data.places || [];

    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      places.map((place: any) => ({
        name: place.displayName?.text,
        address: place.formattedAddress,
      }))
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "Google Places API error:",
      error?.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
