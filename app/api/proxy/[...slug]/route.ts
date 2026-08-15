import { NextRequest, NextResponse } from 'next/server';

// Hàm xử lý proxy chung cho mọi method (GET, POST, PUT, DELETE)
async function proxyRequest(request: NextRequest) {
  // Lấy đường dẫn sau /api/proxy/
  const path = request.nextUrl.pathname.replace('/api/proxy', '');
  
  // URL của Backend Express (sẽ được lấy từ biến môi trường trên Vercel)
  // Nếu chưa có, tạm thời fallback về localhost
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const url = new URL(path, backendUrl);
    // Có thể forward thêm search params nếu cần
    url.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    // Bỏ host header cũ đi để tránh lỗi khi fetch sang domain khác
    headers.delete('host');

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Forward body nếu method không phải GET/HEAD
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const reqBody = await request.text();
      if (reqBody) fetchOptions.body = reqBody;
    }

    const backendResponse = await fetch(url.toString(), fetchOptions);

    const responseHeaders = new Headers(backendResponse.headers);
    // Optional: chỉnh sửa CORS headers nếu cần

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json({ error: 'Backend is unavailable' }, { status: 502 });
  }
}

export { proxyRequest as GET, proxyRequest as POST, proxyRequest as PUT, proxyRequest as DELETE };
