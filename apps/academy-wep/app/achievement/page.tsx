import NFTAchievement from "~/components/achievement/NFTAchievement";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-5xl px-4 py-12 md:py-16 lg:py-20">
        <NFTAchievement />
      </div>
    </main>
  )
}

