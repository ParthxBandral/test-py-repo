export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:5000/video_feed', {
      cache: 'no-store'
    });
    if (!res.ok) {
      return new Response('Failed to load video feed from Flask', { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'multipart/x-mixed-replace; boundary=frame',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return new Response('Flask server is not running', { status: 502 });
  }
}
