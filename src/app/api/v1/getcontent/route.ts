import {connect} from '@/dbConfig/dbConfig';
import ContentPost from '@/models/contentModel';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitRedis';
import { getListCache, setListCache } from '@/lib/cache';


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
        const { searchParams } = new URL(request.url);
        const temp = searchParams.get("temp");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;
        let filter: any = {};
        if(temp === "true"){
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: yesterday };
            filter.temp = true;
        } 

        const ipAddress = request.headers.get('x-forwarded-for') || "";

        // Try cache first
        const cached = await getListCache(temp, page, limit);
        if (cached) {
            const { data, total } = JSON.parse(cached);
            console.log(data)
            return NextResponse.json({message: 'Data fetched successfully (cache)', data, total}, {status: 200});
        }
        // Fallback to DB
        const data = await ContentPost.find(filter, null, { sort: { createdAt: -1 } }).skip(skip).limit(limit);
        const total = await ContentPost.countDocuments(filter);
        // Set cache for 24h
        await setListCache(temp, page, limit, { data, total });

        return NextResponse.json({message: 'Data fetched successfully', data, total}, {status: 200},);
    } catch (error: any) {
        return NextResponse.json( {error: error.message}, {status: 500});
    }
}
