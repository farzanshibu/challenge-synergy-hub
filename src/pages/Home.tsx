import ChallengeButton from "@/components/challenges/ChallengeButton";
import ChallengeForm from "@/components/challenges/ChallengeForm";
import ChallengeList from "@/components/challenges/ChallengeList";
import { Navbar } from "@/components/layout/Navbar";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useAppSettings } from "@/store/appSettingStore";
import { Link } from "react-router-dom";

export default function Home() {
  const { isModernUI } = useAppSettings();
  const { session } = useSupabaseAuth();

  const buildOverlayUrl = () => {
    if (!session) return "/overlay";

    // Create a base64 encoded version of the token data
    const tokenData = JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token || "",
    });

    const encodedToken = btoa(tokenData);
    return `/overlay?auth=${encodedToken}`;
  };

  // Then use this function for your Link component
  const overlayUrl = buildOverlayUrl();

  return isModernUI ? (
    <BackgroundGradientAnimation interactive={false}>
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl p-4 pt-24 md:p-8 md:pt-24">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-800/5 shadow-xl animate-fade-in">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-white">
                Challenge Dashboard
              </h1>

              <Link
                to={overlayUrl}
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open Overlay
              </Link>
            </div>

            <Tabs defaultValue="challenges" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-800/50 border border-zinc-800">
                <TabsTrigger
                  value="challenges"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Challenges
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Manage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="challenges" className="animate-fade-in">
                <ChallengeList />
              </TabsContent>

              <TabsContent value="create" className="animate-fade-in">
                <ChallengeForm />
              </TabsContent>

              <TabsContent value="manage" className="animate-fade-in">
                <ChallengeButton />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </BackgroundGradientAnimation>
  ) : (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-4xl p-4 pt-24 md:p-8 md:pt-24">
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-800/5 shadow-xl animate-fade-in">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-white">
                Challenge Dashboard
              </h1>

              <Link
                to={overlayUrl}
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open Overlay
              </Link>
            </div>

            <Tabs defaultValue="challenges" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-800/50 border border-zinc-800">
                <TabsTrigger
                  value="challenges"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Challenges
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="data-[state=active]:bg-zinc-800"
                >
                  Manage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="challenges" className="animate-fade-in">
                <ChallengeList />
              </TabsContent>

              <TabsContent value="create" className="animate-fade-in">
                <ChallengeForm />
              </TabsContent>

              <TabsContent value="manage" className="animate-fade-in">
                <ChallengeButton />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
