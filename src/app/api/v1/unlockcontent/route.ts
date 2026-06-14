import {connect} from '@/dbConfig/dbConfig';
import ContentPost from '@/models/contentModel';
import { NextRequest, NextResponse } from 'next/server';

connect();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { id, password } = reqBody;

        if (!id || !password) {
            return NextResponse.json({ error: "Snippet ID and password are required" }, { status: 400 });
        }

        const item = await ContentPost.findOne({
            _id: id,
            temp: true,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!item) {
            return NextResponse.json({ error: "Snippet not found or expired" }, { status: 404 });
        }

        if (item.password !== password) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }

        return NextResponse.json({ content: item.content }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
