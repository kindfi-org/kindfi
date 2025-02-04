import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the main README.md file from the project root
    const readmePath = path.join(process.cwd(), '../../../README.md');
    const content = await fs.readFile(readmePath, 'utf-8');
    
    return new NextResponse(content);
  } catch (error) {
    console.error('Error reading README:', error);
    return new NextResponse('Error reading README file', { status: 500 });
  }
}
