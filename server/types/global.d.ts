// types/global.d.ts

import type { Mongoose } from "mongoose";

declare global {
  // var 키워드를 사용하여 전역 네임스페이스에 변수를 선언합니다.
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}
