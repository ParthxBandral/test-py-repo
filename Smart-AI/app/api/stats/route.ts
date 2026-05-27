import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:5000/stats', {
      cache: 'no-store'
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Flask server returned error code' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Flask server not running' }, { status: 502 });
  }
}
