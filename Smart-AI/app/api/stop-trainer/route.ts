import { exec } from 'node:child_process';
import { NextResponse } from 'next/server';

export async function POST(): Promise<Response> {
  return new Promise((resolve) => {
    try {
      // Trigger the end-of-workout speech
      fetch('http://127.0.0.1:5000/finish_workout').catch(() => {});
      // Wait a bit
      setTimeout(() => {
        // Windows command to kill process containing live_trainer_web.py or live_trainer.py
        exec('wmic process where "commandline like \'%live_trainer_web.py%\' or commandline like \'%live_trainer.py%\'" call terminate', () => {
          // Fallback to taskkill to guarantee the process is terminated
          exec('taskkill /F /IM python.exe /T', () => {
            exec('taskkill /F /IM py.exe /T', () => {
              resolve(NextResponse.json({ success: true, message: 'Trainer stopped' }));
            });
          });
        });
      }, 4000);
    } catch (e) {
      resolve(NextResponse.json({ success: true, message: 'Trainer stopped with error' }));
    }
  });
}
