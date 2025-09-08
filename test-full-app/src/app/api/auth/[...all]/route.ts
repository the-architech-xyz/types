import { NextRequest } from 'next/server';
import { authHandler } from '@/lib/auth/nextjs-handler';

export async function GET(request: NextRequest) {
  return authHandler(request);
}

export async function POST(request: NextRequest) {
  return authHandler(request);
}

export async function PUT(request: NextRequest) {
  return authHandler(request);
}

export async function DELETE(request: NextRequest) {
  return authHandler(request);
}

export async function PATCH(request: NextRequest) {
  return authHandler(request);
}
