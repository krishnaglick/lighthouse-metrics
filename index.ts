import { generateReports } from "./generateReports";

generateReports();
setInterval(generateReports, 86400000); // 24h
