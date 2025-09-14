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

        // Get request body
        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Call external auth service
        const AUTH_SERVICE_URL = process.env.AUTH_API;
        if (!AUTH_SERVICE_URL) {
            return NextResponse.json(
                { message: 'Authentication service not configured' },
                { status: 500 }
            );
        }

        const authResponse = await fetch(`${AUTH_SERVICE_URL}/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const authData = await authResponse.json();

        if (!authResponse.ok) {
            return NextResponse.json(
                { message: authData.detail || 'Registration failed' },
                { status: authResponse.status }
            );
        }

        return NextResponse.json(
            { 
                data: authData 
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
