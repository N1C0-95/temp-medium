"use client";

import { Button, Card, Title3, Text } from "@fluentui/react-components";
import { LockClosedRegular, ArrowRightRegular } from "@fluentui/react-icons";
import { signIn } from "next-auth/react";

export default function LoginPage() {

 

  // Function to handle login
  // This function will be called when the user attempts to log in
  const handleLogin = async () => {
    try {
      await signIn("microsoft-entra-id", {
        callbackUrl: "/",
      });
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
    }
  };

  // SVG Microsoft logo
  const MicrosoftIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 32 32"
      style={{ marginRight: 8 }}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="12" height="12" fill="#F35325" />
      <rect x="18" y="2" width="12" height="12" fill="#81BC06" />
      <rect x="2" y="18" width="12" height="12" fill="#05A6F0" />
      <rect x="18" y="18" width="12" height="12" fill="#FFBA08" />
    </svg>
  );

  return (
    
    <div className="page justify-center items-center">
      
        <Card className="flex flex-col items-center gap-2 sm:w-96 w-full p-6">
          
            <LockClosedRegular style={{ fontSize: 48, color: "#2563eb" }} />
            <Title3>Sign in with Microsoft</Title3>
            <Text>
              To continue, log in with your corporate account.
            </Text>
        
          <Button
            appearance="primary"
            icon={MicrosoftIcon}
            size="large"
            className="w-full"
            onClick={handleLogin}
          >
            Sign in 
          </Button>
        </Card>
      
    </div>
    
  );
}
