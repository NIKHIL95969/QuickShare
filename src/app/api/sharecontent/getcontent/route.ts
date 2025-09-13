import {connect} from '@/dbConfig/dbConfig';
import ContentPost from '@/models/contentModel';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitRedis';
import { getListCache, setListCache } from '@/lib/cache';
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

        const { searchParams } = new URL(request.url);
        const temp = searchParams.get("temp");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;
        const contentId = searchParams.get("id");
        const password = searchParams.get("password");

        // If requesting specific content (for password-protected content)
        if (contentId) {
            const content = await ContentPost.findById(contentId);
            if (!content) {
                return NextResponse.json({ error: 'Content not found' }, { status: 404 });
            }

            // Check if content is private and user has access
            if (content.isPrivate) {
                if (!userId || (content.userId && content.userId.toString() !== userId)) {
                    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
                }
            }

            // Check password protection
            if (content.isPasswordProtected) {
                if (!password) {
                    return NextResponse.json({ error: 'Password required' }, { status: 401 });
                }
                const isValidPassword = await bcrypt.compare(password, content.password);
                if (!isValidPassword) {
                    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
                }
            }

            return NextResponse.json({
                message: 'Content fetched successfully',
                data: content
            }, { status: 200 });
        }

        // Build filter for public content
        let filter: any = {
            isPrivate: false // Only show public content by default
        };

        if(temp === "true"){
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: yesterday };
            filter.temp = true;
        } else if(temp === "false") {
            filter.temp = false;
        }

        // If user is authenticated, also show their private content
        if (userId) {
            filter = {
                $or: [
                    { isPrivate: false },
                    { userId: userId },
                    { allowedUsers: userId }
                ]
            };
            
            if(temp === "true"){
                const now = new Date();
                const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                filter.$and = [{ createdAt: { $gte: yesterday } }, { temp: true }];
            } else if(temp === "false") {
                filter.$and = [{ temp: false }];
            }
        }

        // Try cache first
        // const cached = await getListCache(temp, page, limit);
        // if (cached) {
        //     const { data, total } = JSON.parse(cached);
        //     return NextResponse.json({message: 'Data fetched successfully (cache)', data, total}, {status: 200});
        // }
        
        // Fallback to DB
        const data = await ContentPost.find(filter, null, { sort: { createdAt: -1 } }).skip(skip).limit(limit);
        const total = await ContentPost.countDocuments(filter);
        
        // Set cache for 24h
        await setListCache(temp, page, limit, { data, total });

        return NextResponse.json({message: 'Data fetched successfully', data, total}, {status: 200});
    } catch (error: any) {
        console.error('Get content error:', error);
        return NextResponse.json( {error: error.message}, {status: 500});
    }
}
