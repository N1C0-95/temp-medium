"use client"

import { Text} from "@fluentui/react-components";
import { GlobeRegular } from "@fluentui/react-icons";


export default function Footerbar() {
  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 h-16 z-50 bg-gradient-to-r from-[#2563eb] via-[#1e40af] to-[#0f172a] text-white">
      <div className="flex flex-wrap justify-between items-center h-full max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 font-semibold">
          <GlobeRegular style={{ fontSize: 22 }} />
          AI Translator
        </div>
        <div className="flex items-center gap-1">
          
          <Text as="span" size={200}>
             © {new Date().getFullYear()}{" "}
             AI Translator. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
}