import Papa from "papaparse";
import congestionData from '@/public/data/getOff_getOn_avg.json';
// CSV 데이터를 URL에서 로드 (public 폴더에 배포된 파일)
const csvPath = path.join(process.cwd(), "public", "data", "getOff_getOn_avg.csv");
const csvData = require("@/public/data/getOff_getOn_avg.csv");

let parsedData = [];

const loadCSV = async () => {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const result = Papa.parse(text, { header: true });
  parsedData = result.data;
};

const getLevel = (value) => {
  const val = parseFloat(value);
  if (val >= 20) return "혼잡";
  if (val >= 5) return "보통";
  return "여유";
};


export const predictCongestion = async (stationId, hour) => {
  try {
    if (!congestionData || congestionData.length === 0) {
      throw new Error("Data not loaded");
    }

    const hourKey = `${hour.toString().padStart(2, "0")}시`;
    const row = congestionData.find(item => 
      item.정류소ID.toString() === stationId.toString() // 타입 일치 보장
    );

    return row ? getLevel(row[hourKey]) : "정류장 없음";
  } catch (error) {
    console.error("Predict Error:", error);
    return "예측 실패";
  }
};
