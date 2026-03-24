import { db } from "@/lib/db";
import { ChatShell } from "@/components/chat/ChatShell";

export default async function Home() {
  const profile = (await db.companyProfile.findFirst()) || {
    companyName: "Acme Inc",
    logoUrl: null,
    welcomeMessage: "Welcome! Ask me about our company or connected apps."
  };

  return <ChatShell brand={profile} />;
}
