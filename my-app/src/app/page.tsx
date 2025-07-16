"use client";

import { Suspense } from "react";
import HomeContent from "./home-content";

export default function Home(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}