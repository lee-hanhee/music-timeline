import SongForm from "@/app/components/SongForm";
import Timeline from "@/app/components/Timeline";
import SpotifyAuth from "@/app/components/SpotifyAuth";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-4xl font-bold text-center mb-10">Music Timeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <SpotifyAuth />
          <SongForm />
        </div>
        <div className="md:col-span-2">
          <Timeline />
        </div>
      </div>
    </main>
  );
}
