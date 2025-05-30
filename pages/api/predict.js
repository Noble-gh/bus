import { predictCongestion } from "@/lib/predictor";
import Cors from 'cors';

export const config = {
  api: {
    bodyParser: true,
  },
};
// CORS 미들웨어 초기화
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
  origin: '*', // 또는 특정 도메인으로 제한
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { stationId } = req.body;  // station_id → stationId로 변경
    
    if (!stationId) {
      return res.status(400).json({ error: "정류장 ID가 필요합니다." });
    }

    const now = new Date();
    const hour = now.getHours();

    if (hour < 5 || hour > 23) {
      return res.status(400).json({ error: "예측 가능 시간: 05시~23시" });
    }

    const level = await predictCongestion(stationId, hour);

    return res.status(200).json({
      success: true,
      stationId,  // station_id → stationId로 통일
      hour: `${hour}시`,
      congestion_level: level,
    });
    
  } catch (error) {
    console.error("API 오류:", error);
    return res.status(500).json({ 
      error: "서버 내부 오류",
      details: error.message 
    });
  }
}
