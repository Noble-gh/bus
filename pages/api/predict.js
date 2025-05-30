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
  // CORS 미들웨어 실행
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  console.log(">>> Headers:", req.headers);
  console.log(">>> Body Raw:", req.body);

  console.log(">>> Full Request:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
  });
  
  const { station_id } = req.body || {};
  
  if (!station_id) {
    console.error("station_id가 undefined입니다. 전체 요청 본문:", req.body);
    return res.status(400).json({ error: "정류장 ID를 입력하세요." });
  }

  const now = new Date();
  const hour = now.getHours();

  if (hour < 5 || hour > 23) {
    return res
      .status(400)
      .json({ error: "예측 가능한 시간대는 05시~23시입니다." });
  }

  const level = predictCongestion(station_id, hour);

  res.status(200).json({
    station_id,
    hour: `${hour}시`,
    congestion_level: level,
  });
}

