import {connect} from '@/dbConfig/dbConfig';
import ContentPost from '@/models/contentModel';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitRedis';
import { bumpListVersion } from '@/lib/cache';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { authOptions } from '../../auth/[...nextauth]/route';


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

        // Get user session
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const reqBody = await request.json();
        const { 
            content, 
            title, 
            description, 
            tags, 
            isPrivate, 
            isPasswordProtected, 
            password,
            fileType = "text",
            fileName,
            fileSize,
            allowedUsers = []
        } = reqBody;
        
        const { searchParams } = new URL(request.url);
        const temp = searchParams.get("temp") === "true";

        // Validate password protection
        let hashedPassword = null;
        if (isPasswordProtected && password) {
            hashedPassword = await bcrypt.hash(password, 12);
        }

        // Validate private content requires authentication
        if (isPrivate && !userId) {
            return NextResponse.json(
                { error: 'Authentication required for private content' },
                { status: 401 }
            );
        }

        const createContent = new ContentPost({
            content,
            temp,
            userId: userId || null,
            isPrivate: isPrivate || false,
            isPasswordProtected: isPasswordProtected || false,
            password: hashedPassword,
            fileType,
            fileName,
            fileSize,
            allowedUsers,
            title,
            description,
            tags: tags || []
        });

        const savedPost = await createContent.save();
        
        if(!savedPost){
            return NextResponse.json({error: 'Unable to create post'}, {status: 400});
        }

        // Invalidate list caches by bumping namespace version
        await bumpListVersion(temp ? 'true' : null);

        // Generate shareable link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const shareableLink = `${baseUrl}/access/${savedPost._id}`

        return NextResponse.json({
            message: 'Post saved successfully', 
            newPost: {
                id: savedPost._id,
                content: savedPost.content,
                temp: savedPost.temp,
                isPrivate: savedPost.isPrivate,
                isPasswordProtected: savedPost.isPasswordProtected,
                fileType: savedPost.fileType,
                fileName: savedPost.fileName,
                title: savedPost.title,
                description: savedPost.description,
                tags: savedPost.tags,
                createdAt: savedPost.createdAt,
                shareableLink: shareableLink
            }
        }, {status: 201});

    } catch (error: any) {
        console.error('Create content error:', error);
        return NextResponse.json( {error: error.message}, {status: 500});
    }
}
