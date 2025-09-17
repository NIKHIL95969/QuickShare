import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitRedis';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limitCheck = await rateLimit(ip);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(limitCheck.retryAfter || 60) } }
            );
        }

        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token")

        const AUTH_SERVICE_URL = process.env.AUTH_API;
        const authResponse = await fetch(`${AUTH_SERVICE_URL}/v1/auth/verify-email?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const authData = await authResponse.json();

        if (!authResponse.ok) {
            return NextResponse.json(
                { message: authData.detail || 'Token expired or Invalid' },
                { status: authResponse.status }
            );
        }

        // Set auth token in cookie if present
        const response = NextResponse.json(
            { 
                data: authData 
            },
            { status: 200 }
        );

        return response;

    } catch (error: any) {
        console.error('email verify error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}