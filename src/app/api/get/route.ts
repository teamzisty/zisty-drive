import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const filename = formData.get('filename') as string || `${id}.txt`;

        if (!id) {
            return NextResponse.json({ error: 'No id provided' }, { status: 400 });
        }

        const response = await fetch(`https://files.catbox.moe/${id}.enc`);
        if (!response.ok) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}.enc"`
            },
        });
    } catch (error) {
        console.error('Error processing download:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
