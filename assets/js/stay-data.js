/**
 * 호야네 · 호호네 — 운영정보를 수정하는 파일입니다.
 * 이 파일은 웹에 공개됩니다. 도어락/키박스/Wi-Fi 비밀번호, 예약자 정보,
 * API 키, 관리자 비밀번호를 절대로 적지 마세요.
 * 빈 문자열 = 미확인. 주소/전화번호 미입력 시 관련 버튼은 비활성화됩니다.
 * 사용법과 전체 입력 목록: README.md, docs/CONTENT-CHECKLIST.md
 */
window.STAY_GUIDE = {
  schemaVersion: 1,
  site: {
    brand: "호야네 · 호호네",
    tagline: "머무는 시간을 위한 작은 안내서",
    // 실제 사이트 URL을 입력하면 공유 주소에 사용됩니다. 끝에 / 를 붙이세요.
    // GitHub Pages: https://renu-kim.github.io/Hoya-hoho-house/
    publicBaseUrl: "https://renu-kim.github.io/Hoya-hoho-house/",
    // 예시 기본값은 초안입니다. 모든 실제 내용을 검수한 뒤 각 숙소의 ready를 true로 바꾸세요.
    rememberLastStay: true
  },
  stays: {
    hoya: {
      id: "hoya",
      name: "호야네",
      englishName: "HOYANE",
      theme: "forest",
      ready: false,
      updatedAt: "",
      tagline: "오늘은 조금,\n느긋하게 머물러요.",
      intro: "반가워요. 호야네에서 보내는 시간이 편안하도록, 도착부터 떠나는 순간까지 필요한 안내를 한곳에 모았어요.",
      // 실제 사진이 준비되면 assets/images/hoya/hero.webp 등을 입력하세요.
      // 비어 있으면 ‘실제 사진이 아닌 브랜드 일러스트’가 표시됩니다.
      heroImage: "",
      heroAlt: "호야네 숙소 전경",
      notice: "안내 내용을 준비하고 있어요. 실제 이용 조건은 예약 시 전달받은 메시지를 우선 확인해 주세요.",
      address: {
        road: "",
        detail: "",
        postalCode: "",
        directions: "",
        // 지도 서비스에서 복사한 https 공유 링크를 입력하세요. 임의 좌표를 만들지 않습니다.
        naverUrl: "",
        kakaoUrl: ""
      },
      contact: {
        label: "호야네 관리자",
        phone: "",
        hours: "",
        // 선택: 공식 카카오톡 채널 등 공개 문의 링크
        channelLabel: "공식 문의 채널",
        channelUrl: ""
      },
      checkIn: {
        time: "",
        method: "",
        earlyArrival: "",
        lateArrival: ""
      },
      checkOut: {
        time: "",
        instructions: "",
        checklist: [
          "두고 가는 소지품이 없는지 확인했어요.",
          "예약 안내에 적힌 퇴실 정리사항을 확인했어요.",
          "전달할 내용이 있다면 관리자에게 남겼어요."
        ]
      },
      parking: {
        capacity: null,
        description: "",
        arrivalTip: "",
        alternative: "",
        // 도로변 주차를 임의로 권장하지 마세요. 주차 가능 여부가 확인된 장소만 등록합니다.
        image: "",
        imageAlt: "호야네 지정 주차 위치"
      },
      wifi: {
        ssid: "",
        help: "연결 정보는 객실 내 안내 또는 예약 메시지를 확인해 주세요."
      },
      spaces: [
        { title: "객실 · 침구", icon: "bed", body: "", keywords: "침실 침대 이불 인원" },
        { title: "주방 · 비품", icon: "kitchen", body: "", keywords: "식기 조리 전자레인지 인덕션 냉장고" },
        { title: "욕실 · 어메니티", icon: "bath", body: "", keywords: "수건 샴푸 드라이기" }
      ],
      facilities: [
        { title: "냉방 · 난방", icon: "thermometer", body: "", image: "", keywords: "에어컨 보일러 온도 리모컨" },
        { title: "TV · 미디어", icon: "tv", body: "", image: "", keywords: "티비 넷플릭스 OTT 리모컨" },
        { title: "취사 · 주방기기", icon: "kitchen", body: "", image: "", keywords: "인덕션 전자레인지 가스레인지" },
        { title: "바비큐 이용", icon: "flame", body: "", image: "", keywords: "바베큐 숯 그릴 불" },
        { title: "쓰레기 · 분리수거", icon: "recycle", body: "", image: "", keywords: "음식물 쓰레기 봉투 퇴실" }
      ],
      rules: [
        { title: "입실 인원 · 방문객", body: "" },
        { title: "흡연 · 반려동물", body: "" },
        { title: "소음 · 배려 시간", body: "" },
        { title: "시설 파손 · 분실", body: "" }
      ],
      // 본인 소유/사용 허가를 받은 실제 숙소 사진만 등록하세요.
      // { src: "assets/images/hoya/room.webp", alt: "거실 전경", caption: "거실" }
      gallery: [],
      // 실제 위치를 확인한 장소만 등록하세요. 이동시간은 이동수단/기준을 함께 표기하세요.
      // { name: "실제 장소명", category: "관광", description: "소개", distance: "숙소에서 차량 약 10분 · 교통에 따라 다름",
      //   image: "", mapUrl: "https://...", checkedAt: "YYYY-MM-DD" }
      nearby: [],
      faqs: [
        { question: "입실 안내는 어디에서 확인하나요?", answer: "예약하신 플랫폼 또는 관리자가 전달한 예약 메시지를 확인해 주세요. 출입 정보는 공개 안내 페이지에 표시하지 않습니다.", keywords: "체크인 입실 비밀번호 도어락" },
        { question: "예정보다 일찍 또는 늦게 도착하면 어떻게 하나요?", answer: "가능 여부는 예약 조건과 당일 운영 상황에 따라 달라질 수 있어요. 도착 전에 관리자에게 확인해 주세요.", keywords: "얼리 조기 늦은 레이트" },
        { question: "비품이 부족하거나 시설 이용이 어려워요.", answer: "어떤 비품이나 시설인지 관리자에게 알려 주세요. 시설 사진이나 현재 상태를 함께 전달하면 상황 확인에 도움이 됩니다.", keywords: "수건 고장 에어컨 난방 TV" },
        { question: "예약 변경이나 취소는 어디로 문의하나요?", answer: "예약하신 플랫폼의 예약 내역에서 적용 조건을 확인한 뒤, 해당 플랫폼 또는 관리자에게 문의해 주세요. 이 안내 페이지에서는 예약 변경·취소를 처리하지 않습니다.", keywords: "예약 환불 취소 변경" }
      ],
      emergency: {
        extinguisher: "",
        exit: "",
        firstAid: "",
        hospital: ""
      }
    },
    hoho: {
      id: "hoho",
      name: "호호네",
      englishName: "HOHONE",
      theme: "clay",
      ready: false,
      updatedAt: "",
      tagline: "함께라서 더 좋은,\n우리의 하루.",
      intro: "반가워요. 호호네에서의 하루를 가볍게 시작하세요. 찾아오는 길부터 숙소 이용 방법까지, 필요한 순간에 꺼내 보는 안내서예요.",
      heroImage: "",
      heroAlt: "호호네 숙소 전경",
      notice: "안내 내용을 준비하고 있어요. 실제 이용 조건은 예약 시 전달받은 메시지를 우선 확인해 주세요.",
      address: { road: "", detail: "", postalCode: "", directions: "", naverUrl: "", kakaoUrl: "" },
      contact: { label: "호호네 관리자", phone: "", hours: "", channelLabel: "공식 문의 채널", channelUrl: "" },
      checkIn: { time: "", method: "", earlyArrival: "", lateArrival: "" },
      checkOut: {
        time: "", instructions: "",
        checklist: ["두고 가는 소지품이 없는지 확인했어요.", "예약 안내에 적힌 퇴실 정리사항을 확인했어요.", "전달할 내용이 있다면 관리자에게 남겼어요."]
      },
      parking: { capacity: null, description: "", arrivalTip: "", alternative: "", image: "", imageAlt: "호호네 지정 주차 위치" },
      wifi: { ssid: "", help: "연결 정보는 객실 내 안내 또는 예약 메시지를 확인해 주세요." },
      spaces: [
        { title: "객실 · 침구", icon: "bed", body: "", keywords: "침실 침대 이불 인원" },
        { title: "주방 · 비품", icon: "kitchen", body: "", keywords: "식기 조리 전자레인지 인덕션 냉장고" },
        { title: "욕실 · 어메니티", icon: "bath", body: "", keywords: "수건 샴푸 드라이기" }
      ],
      facilities: [
        { title: "냉방 · 난방", icon: "thermometer", body: "", image: "", keywords: "에어컨 보일러 온도 리모컨" },
        { title: "TV · 미디어", icon: "tv", body: "", image: "", keywords: "티비 넷플릭스 OTT 리모컨" },
        { title: "취사 · 주방기기", icon: "kitchen", body: "", image: "", keywords: "인덕션 전자레인지 가스레인지" },
        { title: "바비큐 이용", icon: "flame", body: "", image: "", keywords: "바베큐 숯 그릴 불" },
        { title: "쓰레기 · 분리수거", icon: "recycle", body: "", image: "", keywords: "음식물 쓰레기 봉투 퇴실" }
      ],
      rules: [
        { title: "입실 인원 · 방문객", body: "" },
        { title: "흡연 · 반려동물", body: "" },
        { title: "소음 · 배려 시간", body: "" },
        { title: "시설 파손 · 분실", body: "" }
      ],
      gallery: [],
      nearby: [],
      faqs: [
        { question: "입실 안내는 어디에서 확인하나요?", answer: "예약하신 플랫폼 또는 관리자가 전달한 예약 메시지를 확인해 주세요. 출입 정보는 공개 안내 페이지에 표시하지 않습니다.", keywords: "체크인 입실 비밀번호 도어락" },
        { question: "예정보다 일찍 또는 늦게 도착하면 어떻게 하나요?", answer: "가능 여부는 예약 조건과 당일 운영 상황에 따라 달라질 수 있어요. 도착 전에 관리자에게 확인해 주세요.", keywords: "얼리 조기 늦은 레이트" },
        { question: "비품이 부족하거나 시설 이용이 어려워요.", answer: "어떤 비품이나 시설인지 관리자에게 알려 주세요. 시설 사진이나 현재 상태를 함께 전달하면 상황 확인에 도움이 됩니다.", keywords: "수건 고장 에어컨 난방 TV" },
        { question: "예약 변경이나 취소는 어디로 문의하나요?", answer: "예약하신 플랫폼의 예약 내역에서 적용 조건을 확인한 뒤, 해당 플랫폼 또는 관리자에게 문의해 주세요. 이 안내 페이지에서는 예약 변경·취소를 처리하지 않습니다.", keywords: "예약 환불 취소 변경" }
      ],
      emergency: { extinguisher: "", exit: "", firstAid: "", hospital: "" }
    }
  }
};
