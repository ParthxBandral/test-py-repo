import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
    }

    const query = `
      [out:json][timeout:15];
      (
        node["leisure"~"fitness_centre|gym|park|playground"](around:8000, ${lat}, ${lon});
        node["amenity"~"gym|fitness_centre"](around:8000, ${lat}, ${lon});
      );
      out;
    `;

    const mirrors = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.osm.ch/api/interpreter"
    ];

    let data: any = null;
    let success = false;

    for (const mirror of mirrors) {
      try {
        const response = await fetch(mirror, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const json = await response.json();
          if (json && json.elements) {
            data = json;
            success = true;
            break;
          }
        }
      } catch (err) {
        console.error(`Explore Proxy: Failed mirror ${mirror}`, err);
      }
    }

    if (success && data) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: "All mirrors timed out or failed" }, { status: 502 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
