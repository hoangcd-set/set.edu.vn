import { NextResponse } from 'next/server';
import { AwsClient } from 'aws4fetch';
import { requireAdmin } from '../../../../lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(req) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'File tối đa 15MB' }, { status: 400 });

  const safeName = (file.name || 'file').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-80);
  const now = new Date();
  const key = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now()}-${safeName}`;

  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto', service: 's3',
  });
  const endpoint = process.env.R2_S3_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const res = await r2.fetch(`${endpoint}/${process.env.R2_BUCKET || 'seteduvn-media'}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) return NextResponse.json({ error: `R2 lỗi ${res.status}` }, { status: 500 });

  const publicUrl = `${process.env.NEXT_PUBLIC_MEDIA_URL || 'https://media.set.edu.vn'}/${key}`;
  return NextResponse.json({ url: publicUrl, key });
}
