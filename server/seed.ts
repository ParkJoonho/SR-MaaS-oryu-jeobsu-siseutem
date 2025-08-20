import { db } from "./db";
import { errors } from "@shared/schema";

export async function seedTestData() {
  try {
    console.log("테스트 데이터 생성 중...");
    
    // 기존 데이터 확인
    const existingErrors = await db.select().from(errors).limit(1);
    if (existingErrors.length > 0) {
      console.log("이미 데이터가 존재합니다.");
      return;
    }

    const testErrors = [
      {
        title: "승차권 발매기 오류",
        content: "1번 플랫폼 승차권 발매기가 작동하지 않습니다. 화면이 검은색으로 나오고 터치가 되지 않습니다.",
        reporter: "김철수",
        system: "역무지원" as const,
        priority: "중간" as const,
        status: "신규" as const,
        attachments: []
      },
      {
        title: "화장실 조명 고장",
        content: "2층 남자화장실 조명이 깜빡거리고 있습니다. 안전상 문제가 있을 수 있습니다.",
        reporter: "박영희",
        system: "시설물관리" as const,
        priority: "높음" as const,
        status: "진행중" as const,
        attachments: []
      },
      {
        title: "비상벨 작동 불량",
        content: "3번 승강장 비상벨을 눌러도 신호가 가지 않습니다. 안전 문제로 즉시 수리가 필요합니다.",
        reporter: "이민수",
        system: "안전관리" as const,
        priority: "긴급" as const,
        status: "완료" as const,
        attachments: []
      },
      {
        title: "에스컬레이터 소음",
        content: "상행 에스컬레이터에서 이상한 소음이 발생합니다. 기계적 문제가 있는 것 같습니다.",
        reporter: "정수진",
        system: "시설물관리" as const,
        priority: "중간" as const,
        status: "보류" as const,
        attachments: []
      },
      {
        title: "예약 시스템 오류",
        content: "온라인 예약 시스템에서 결제 완료 후 예약 확인이 되지 않는 문제가 발생했습니다.",
        reporter: "최준호",
        system: "역무지원" as const,
        priority: "높음" as const,
        status: "진행중" as const,
        attachments: []
      },
      {
        title: "CCTV 화질 불량",
        content: "지하 2층 CCTV 카메라의 화질이 흐릿하여 모니터링에 어려움이 있습니다.",
        reporter: "홍길동",
        system: "안전관리" as const,
        priority: "중간" as const,
        status: "신규" as const,
        attachments: []
      }
    ];

    // 날짜를 다양하게 설정 (최근 2주간)
    const now = new Date();
    
    for (let i = 0; i < testErrors.length; i++) {
      const daysAgo = Math.floor(Math.random() * 14); // 0-13일 전
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      await db.insert(errors).values({
        ...testErrors[i],
        reporterId: "test-user-id", // 기본 테스트 사용자 ID
        createdAt,
        updatedAt: createdAt
      });
    }

    console.log(`${testErrors.length}개의 테스트 데이터가 생성되었습니다.`);
  } catch (error) {
    console.error("테스트 데이터 생성 실패:", error);
  }
}