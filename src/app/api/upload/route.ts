import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | Blob | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const uploadFormData = new FormData();
        uploadFormData.append('reqtype', 'fileupload');
        const fileName = (file as File).name || 'file.enc';
        uploadFormData.append('fileToUpload', file as Blob, fileName);

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: uploadFormData,
        });

        const result = await response.text();

        if (!response.ok) {
            console.error('External upload failed:', response.status, result);
            return NextResponse.json({ error: 'Upload to external API failed', details: result }, { status: 500 });
        }

        const responseData = {
            id: result.replace('https://files.catbox.moe/', '').replace(/\.[^/.]+$/, ''),
            filename: fileName,
            date: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            url: result,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
