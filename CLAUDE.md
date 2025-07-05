# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

학습을 위한 플래시카드 공유 웹 앱

## Stack

1. Nuxt 3
2. Nuxt UI v3.1.3 (ui.nuxt.com/getting-started)
3. MongoDB + Mongoose
4. nuxt-auth-utils (nuxt.com/modules/auth-utils)
5. dayjs

## Features

1. `/auth` 회원 기능:

   - `/auth/signup` 가입 (ID, Password로만)
   - `/auth/login` 로그인, 로그아웃
   - `/auth/me` 패스워드 변경, 내가 만든 플래시카드, 내가 북마크한 플래시카드 목록, 탈퇴

2. `/` `/?search="ADHD"` 플래시카드 목록, 검색

   - 북마크 많은 순으로 배치

3. 플래시카드 만들기, 삭제하기

   - `/new` 제목, 설명, 그리고 앞, 뒤를 작성할 수 있는 카드들
   - 편집 불가능, 오직 삭제만

4. 플래시카드 하기

   - `/[id]` 플래시카드 하기

5. 북마크

## Target

- 한국 사용자

## Code

- 절대 any를 쓰지 마
- 함수는 선언식, 콜백으로는 화살표, 메서드로는 concise method
- 기본값을 위해서는 ||보다는 ??사용
- try catch는 에러의 타입을 이용하기보다는 가능한 좁은 스코프로 좁혀서 처리

## Style

- 다크, 라이트 모드는 시스템 테마로만. 따로 색지정 ㄴㄴ
- 좌우간격 4, 모바일, 플래시카드판은 0 (px-0 sm:px-4)
- 화면 크기는 max-w-4xl
- 그림자 사용 금지
- primary, negative, error 이 외의 색 금지
- 트랜지션 금지
- 웬만하면 무채색으로

## Writing

- 가능한 간결하게 쓰기. 만든 사람 (x) -> by (o)
