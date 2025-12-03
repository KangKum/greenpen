let myDomain = "";

if (window.location.hostname === "localhost") {
  // 로컬 개발 환경
  myDomain = "http://localhost:8080"; // 너 백엔드 로컬 포트
} else {
  // 배포 환경
  myDomain = "https://api.greenpen.co.kr"; // Render 커스텀 도메인
}

export default myDomain;
