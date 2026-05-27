import { spawn, exec } from 'node:child_process';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const exercise = body.exercise || 'squat';

    // First, kill any existing live_trainer.py or live_trainer_web.py process to free up the webcam
    await new Promise<void>((resolve) => {
      exec('wmic process where "commandline like \'%live_trainer_web.py%\' or commandline like \'%live_trainer.py%\'" call terminate', () => {
        // Fallback to taskkill to guarantee the process is terminated
        exec('taskkill /F /IM python.exe /T', () => {
          exec('taskkill /F /IM py.exe /T', () => {
            // Wait a bit longer (2s) for OpenCV DirectShow to fully release the camera hardware
            setTimeout(resolve, 2000);
          });
        });
      });
    });

    // The root folder is one level up from Smart-AI usually, or we can use absolute path if needed.
    // Assuming Smart-AI is in the ai/ folder alongside live_trainer.py
    const cwd = path.resolve(process.cwd(), '..');
    const scriptPath = path.resolve(cwd, 'live_trainer_web.py');

    console.log(`Starting live trainer for ${exercise} at ${scriptPath}`);

    // Spawn the python process detached so it can run independently of the HTTP request lifecycle
    const pythonProcess = spawn('python', ['live_trainer_web.py', exercise], {
      cwd: cwd,
      detached: true,
      stdio: 'ignore'
    });

    pythonProcess.unref();

    return NextResponse.json({ success: true, message: `Started live trainer for ${exercise}` });
  } catch (error) {
    console.error('Error starting trainer:', error);
    return NextResponse.json({ success: false, error: 'Failed to start trainer' }, { status: 500 });
  }
}
