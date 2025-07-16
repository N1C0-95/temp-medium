"use client";
import {
  DrawerHeaderTitle,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,

} from "@fluentui/react-components";
import { HistoryRegular, HomeRegular } from "@fluentui/react-icons";
import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useMenuPanel } from "@/app/store/useMenuPanel";
import { useSession } from "next-auth/react";
import { useConfigStore } from "@/app/store/configStore";




export default function AppMenu() {

  const isHistoryEnabled = useConfigStore((state) => state.config?.isHistoryEnabled);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: session } = useSession();
 const menu =  useMenuPanel();
  const router = useRouter();
  const pathname = usePathname();

 
  return (
    
    
   <>
    {session && 
    <NavDrawer
      open={menu.open}
      onOpenChange={menu.toggle}
      selectedValue={pathname}
      type={menu.type === 0 ? "inline" : "overlay"}
      className="p-4"
    >
      <NavDrawerHeader>
        <DrawerHeaderTitle>
          Menu
        </DrawerHeaderTitle>
      </NavDrawerHeader>
      <NavDrawerBody>
        <NavItem
          as="button"
          icon={<HomeRegular style={{ fontSize: 18 }} />}
          onClick={() => {
            setDrawerOpen(false);
            router.push("/");
          }}
          value="/"
        >
          Translate
        </NavItem>
        {isHistoryEnabled && <NavItem
          as="button"
          icon={<HistoryRegular style={{ fontSize: 18 }} />}
          onClick={() => {
            setDrawerOpen(false);
            router.push("/history");
          }}
          value="/history"
        >
          History
        </NavItem> }
      </NavDrawerBody>
    </NavDrawer>
}</>
  );
}
