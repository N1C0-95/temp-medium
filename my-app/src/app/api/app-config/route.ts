import { NextResponse } from 'next/server';
import config from '@/config/appConfig';

export async function GET() {
  return NextResponse.json(config);
}