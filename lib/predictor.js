import Papa from "papaparse";

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

export const predictCongestion = (stationId, hour) => {
  const hourKey = `${hour.toString().padStart(2, "0")}시`;
  const row = csvData.find(row => row.정류소ID === stationId.toString());
  try {
    if (parsedData.length === 0) await loadCSV();

    const hourKey = `${hour.toString().padStart(2, "0")}시`;
    const row = parsedData.find((row) => row["정류소ID"] === stationId.toString());

    if (!row) return "정류장 없음";
    
    const val = row[hourKey];
    return getLevel(val);
  } catch (error) {
    console.error("예측 중 오류:", error);
    return "예측 실패";
  }
};
