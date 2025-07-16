"use client";

import { Button } from "@fluentui/react-components";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4 text-lg">The page you are looking for does not exist.</p>
         <Button><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  );
}