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
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const id = searchParams.get("id") || "";
        
        const skip = (page - 1) * limit;
        let filter: any = {
            temp: true,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        };
        
        if (id) {
            filter._id = id;
        } else if (search) {
            filter.content = { $regex: search, $options: 'i' };
            filter.$or = [
                { password: { $exists: false } },
                { password: "" },
                { password: null }
            ];
        }

        const data = await ContentPost.find(filter, null, { sort: { createdAt: -1 } }).skip(skip).limit(limit);
        const total = await ContentPost.countDocuments(filter);

        const maskedData = data.map((item: any) => {
            const hasPassword = !!item.password;
            return {
                _id: item._id,
                temp: item.temp,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                isProtected: hasPassword,
                content: hasPassword ? "" : item.content
            };
        });

        return NextResponse.json({message: 'Data fetched successfully', data: maskedData, total}, {status: 200});
    } catch (error: any) {
        return NextResponse.json( {error: error.message}, {status: 500});
    }
}

