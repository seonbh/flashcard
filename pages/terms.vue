<template>
  <div class="w-full max-w-4xl mx-auto px-6 py-12">
    <h1 class="text-5xl font-bold mb-8">이용약관</h1>

    <!-- 서론·약관 효력 -->
    <div class="mb-12">
      <p class="mb-4 leading-relaxed">
        본 약관은 <strong>주식회사 넌틱</strong>(이하 "회사")가 제공·운영하는
        플래시카드 콘텐츠 생성·공유 서비스 <strong>플래시카드</strong>(이하
        "서비스")를 이용함에 있어 회사와 회원 간 권리·의무 및 책임사항, 기타
        필요한 사항을 규정합니다.
      </p>
      <p class="leading-relaxed">
        회원은 <strong>“회원가입” 버튼을 클릭</strong>함으로써 본 약관에 동의한
        것으로 간주되며, 약관은 게시 즉시 효력이 발생합니다. 회사는 약관을
        변경할 수 있으며, 변경 7일 전에 서비스 내 공지합니다. 변경 후에도
        서비스를 계속 이용하면 수정된 약관에 동의한 것으로 봅니다.
      </p>
    </div>

    <!-- 용어 정의 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">용어 정의</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>“회원”: 약관에 동의하고 계정을 생성한 자</li>
        <li>“콘텐츠”: 회원이 서비스에 생성·업로드한 플래시카드, 댓글 등</li>
        <li>“회사”: 서비스를 운영·관리하는 법인(주식회사 넌틱)</li>
      </ul>
    </div>

    <!-- 가입·연령 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">회원가입 및 연령 제한</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>
          회원은 <strong>만 14세 이상</strong>이어야 하며, 14세 미만은 가입할 수
          없습니다.
        </li>
        <li>
          회사는 허위정보·중복 ID·법령 위반 소지가 있는 신청을 거절할 수
          있습니다.
        </li>
        <li>
          회원은 언제든지 탈퇴할 수 있으며, 탈퇴 시 작성자 정보는 삭제되어
          콘텐츠는 익명화되며 보존됩니다. 콘텐츠 보존을 원하지 않을 경우, 탈퇴
          전에 직접 삭제해주시길 권장합니다.
        </li>
        <li>
          <strong
            >비밀번호를 분실한 경우 복구 서비스가 제공되지 않으므로 새 계정을
            생성해야 합니다.</strong
          >
        </li>
      </ul>
    </div>

    <!-- 회원 의무·금지행위 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">회원의 의무 및 금지행위</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>약관 및 대한민국 법령 준수</li>
        <li>타인 비방·욕설·음란·불법 정보 게시 금지</li>
        <li>저작권·민감정보 등 타인의 권리를 침해하는 행위 금지</li>
        <li>서비스의 정상적 운영 방해(스팸, 크롤링, 해킹 시도 등) 금지</li>
      </ul>
    </div>

    <!-- 회사 권한 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">회사의 권리 및 조치</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>
          회사는 약관·법령 위반 시 사전 통보 후 게시물 삭제, 계정 정지·해지 가능
        </li>
        <li>
          서비스 안정 운영을 위해 필요시 기능 수정·중단·종료 가능(사전 7일 공지)
        </li>
      </ul>
    </div>

    <!-- 콘텐츠 권리 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">콘텐츠 저작권 및 이용</h2>
      <p class="leading-relaxed">
        회원이 서비스에 게시한 콘텐츠의 저작권은 해당 회원에게 있으며, 회원은
        회사에게 콘텐츠를 서비스 운영·홍보·통계 목적으로
        <strong>비독점적·무상·지역 제한 없는 사용권</strong>을 부여합니다.
        회원은 자신이 게시한 콘텐츠가 제3자의 권리를 침해하지 않음을 보증하며,
        분쟁 발생 시 회원이 책임을 부담합니다.
      </p>
    </div>

    <!-- 통계·광고·제3자 서비스 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">통계·광고 및 제3자 서비스</h2>
      <p class="leading-relaxed">
        본 서비스는 Google Analytics 및 Google AdSense를 통해 맞춤형 광고와
        통계를 제공합니다. 관련 개인정보 처리 사항은
        <NuxtLink to="/privacy" class="underline" target="_blank"
          >개인정보처리방침</NuxtLink
        >을 따릅니다.
      </p>
    </div>

    <!-- 책임 제한 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">책임 제한</h2>
      <ul class="list-disc list-inside space-y-1">
        <li>
          회사는 천재지변·네트워크 장애 등 불가항력으로 인한 손해에 책임을 지지
          않습니다.
        </li>
        <li>
          회원 상호 간 또는 회원과 제3자 사이에서 발생한 분쟁은 당사자 간 해결을
          원칙으로 하며, 회사는 이에 개입하지 않습니다.
        </li>
      </ul>
    </div>

    <!-- 손해배상 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">손해배상</h2>
      <p class="leading-relaxed">
        회사는 서비스 이용과 관련하여 <strong>직접적인 손해</strong>에 한해
        책임을 부담하며, 손해배상 총액은 최근 3개월간 회사가 해당 회원으로부터
        얻은 수익(없는 경우 0원)을 한도로 합니다.
      </p>
    </div>

    <!-- 준거법·관할 -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4">준거법 및 관할 법원</h2>
      <p class="leading-relaxed">
        본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이
        발생할 경우 <strong>서울중앙지방법원</strong>을 전속적 관할 법원으로
        합니다.
      </p>
    </div>

    <!-- 약관 변경 고지 -->
    <div class="mb-4">
      <h2 class="text-xl font-semibold mb-4">약관 변경</h2>
      <p class="leading-relaxed">
        회사는 약관을 변경할 경우 시행 7일 전(중요 변경은 30일 전) 서비스 내에
        공지합니다. 회원이 변경 내용에 동의하지 않을 경우 언제든지 탈퇴할 수
        있으며, 변경 고지 후 서비스를 계속 이용하면 변경 약관에 동의한 것으로
        간주합니다.
      </p>
    </div>

    <!-- 연락처 -->
    <div class="mt-8 text-sm text-gray-600">
      문의:
      <a href="mailto:support@nontick.com" class="underline"
        >support@nontick.com</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "이용약관 | 플래시카드",
  description: "이용약관",
  robots: "noindex, nofollow",
});
</script>
