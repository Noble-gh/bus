import Cors from 'cors';

// Vercel 환경에 최적화된 CORS 설정
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: [
    'https://bus-flame.vercel.app',
    'http://localhost:3000'
  ],
  allowedHeaders: ['Content-Type', 'x-vercel-id']
});

export default async function handler(req, res) {
  // 1. CORS 실행
  await new Promise((resolve, reject) => {
    cors(req, res, (result) => result instanceof Error ? reject(result) : resolve(result));
  });

  // 2. Vercel 프록시 헤더 필터링
  const cleanHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([key]) => !key.startsWith('x-vercel-'))
  );

  // 3. 본문 파싱 (Vercel 특수 대응)
  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON", details: e.message });
  }

  // 4. 필드명 유연하게 처리
  const stationId = body.station_id || body.stationId;
  if (!stationId) {
    return res.status(400).json({
      error: "Station ID required",
      received_body: body,
      headers: cleanHeaders
    });
  }

  // 5. 타입 강제 변환 (Vercel 환경 대응)
  const id = String(stationId).trim();
  const hour = new Date().getHours();

  // 6. 응답
  return res.status(200).json({
    success: true,
    stationId: id,
    hour: `${hour}시`,
    congestion_level: "여유" // 임시 응답
  });
}
