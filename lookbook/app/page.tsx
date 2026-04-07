import { getNailArts } from "@/lib/nailarts";
import LookbookClient from "./components/LookbookClient";

export default function Home() {
  const arts = getNailArts();

  const seasons = [...new Set(arts.map((a) => a.season).filter(Boolean))].sort(
    (a, b) => b.localeCompare(a)
  );

  return (
    <div className="mx-auto max-w-[390px] px-5 pb-16 pt-10">
      <LookbookClient arts={arts} seasons={seasons} />
    </div>
  );
}
