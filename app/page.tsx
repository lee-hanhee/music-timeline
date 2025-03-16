import SongForm from "@/app/components/SongForm";
import Timeline from "@/app/components/Timeline";
import Header from "@/app/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <SongForm />
          </div>
          <div className="md:col-span-2">
            <Timeline />
          </div>
        </div>
      </main>
    </div>
  );
}
