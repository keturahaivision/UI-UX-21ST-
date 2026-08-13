import HeroRoots from '@/components/home/HeroRoots';
import Strata from '@/components/home/Strata';
import TheConnection from '@/components/home/TheConnection';
import ChapterScale from '@/components/chapters/ChapterScale';
import ChapterWork from '@/components/chapters/ChapterWork';
import ChapterBegin from '@/components/chapters/ChapterBegin';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  description: 'DMF Engineering works at the level beneath successful development — master planning, roads & infrastructure, traffic, civil, structural, architecture and landscape across the UAE and Gulf.',
});

// Narrative spine: The City Above → The Systems Below → The Connection → Scale → Work → Begin.
export default function HomePage() {
  return (
    <>
      <HeroRoots />
      <Strata />
      <TheConnection />
      <ChapterScale />
      <ChapterWork />
      <ChapterBegin />
    </>
  );
}
