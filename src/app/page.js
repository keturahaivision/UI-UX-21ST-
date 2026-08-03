import ChapterLand from '@/components/chapters/ChapterLand';
import ChapterVision from '@/components/chapters/ChapterVision';
import ChapterStructure from '@/components/chapters/ChapterStructure';
import ChapterScale from '@/components/chapters/ChapterScale';
import ChapterWork from '@/components/chapters/ChapterWork';
import ChapterBegin from '@/components/chapters/ChapterBegin';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  description: 'From empty land to a living city — DMF Engineering delivers master planning, roads & infrastructure, architecture and structural design across the UAE and Gulf.',
});

export default function HomePage() {
  return (
    <>
      <ChapterLand />
      <ChapterVision />
      <ChapterStructure />
      <ChapterScale />
      <ChapterWork />
      <ChapterBegin />
    </>
  );
}
