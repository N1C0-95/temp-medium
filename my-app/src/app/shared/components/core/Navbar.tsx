"use client";

import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Title3,
  Avatar,
  NavDrawer,
  NavDrawerHeader,
  NavDrawerBody,
  NavItem
} from "@fluentui/react-components";
import { signOut, useSession } from "next-auth/react";
import {
  PersonCircleRegular,
  SignOutRegular,
  MailRegular
} from "@fluentui/react-icons";
import { Session } from "next-auth";



import Image from "next/image"
import { useMenuPanel } from "@/app/store/useMenuPanel";


export interface NavbarProps {
  onMenuClick?: () => void;
}
export default function Navbar(props: NavbarProps) {
  const { data: session } = useSession();
  const { open, setOpen } = useMenuPanel();


  const email = (session as Session)?.user?.email || "NA";
  const name = (session as Session)?.user?.name || "";
  const image = (session as Session)?.user?.image || undefined;
 

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const menu =  useMenuPanel();
  return (
    <>
      

      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        {/* Hamburger Menu */}
        <div className="flex items-center gap-5">
        {session && menu.type===1 && <Button
          appearance="subtle"
          icon={<span style={{ fontSize:18 }}>☰</span>}
          aria-label="Apri menu"
          onClick={() => setOpen(!open)}
          className="mr-2"
        />}
        
        {/* Logo e titolo */}
        <div className="flex items-center gap-3">
         
         <Image
            src="/logo.png"
            alt="Logo"
            width={50}
            height={50}
            priority
            />
          <Title3 className="text-blue-950 ">
            AI Translator
          </Title3>
        </div>

        </div>

        {/* Utente */}
        {session && (
          <Menu>
            <MenuTrigger>
              <Button
                appearance="subtle"
                size="large"
                icon={
                  image ? (
                    <Avatar name={name} image={{ src: image }} />
                  ) : (
                    <PersonCircleRegular />
                  )
                }
              >
                <span className="ml-2 hidden md:inline">{name || email}</span>
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<MailRegular />} disabled>
                  {email}
                </MenuItem>
                <MenuItem icon={<SignOutRegular />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      </nav>
      
    </>
  );
}
