import {connect} from '@/dbConfig/dbConfig';
import ContentPost from '@/models/contentModel';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitRedis';


connect();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest){
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limitCheck = await rateLimit(ip);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(limitCheck.retryAfter || 60) } }
            );
        }
        const reqBody = await request.json();
        const { content, password } = reqBody;

        const createContent = new ContentPost({
            content,
            temp: true,
            password: password || undefined
        });
        const savedPost = await createContent.save();
        
        if(!savedPost){
            return NextResponse.json({error: 'Unable to create post'}, {status: 400});
        }

        return NextResponse.json({message: 'Post saved successfully', newPost: savedPost}, {status: 201});

    } catch (error: any) {
        return NextResponse.json( {error: error.message}, {status: 500});
    }
}

