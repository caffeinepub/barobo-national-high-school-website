import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import PhilippineTimeClock from '../components/PhilippineTimeClock';
import WeatherForecastSection from '../components/WeatherForecastSection';
import FacebookPresenceBlock from '../components/FacebookPresenceBlock';
import SchoolActivitiesSlider from '../components/SchoolActivitiesSlider';
import { Eye, Target, Star, BookOpen, FileText, GraduationCap, Download, ScrollText, Loader2 } from 'lucide-react';
import { useGetBNHSHymnVideo } from '../hooks/useQueries';

export default function HomePage() {
  const { actor } = useActor();
  const { data: hymnVideo, isLoading: hymnLoading } = useGetBNHSHymnVideo();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const weatherRef = useRef<HTMLDivElement>(null);
  const [weatherHeight, setWeatherHeight] = useState<number | undefined>(undefined);

  const { data: totalVisitors } = useQuery({
    queryKey: ['totalVisitors'],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getTotalVisitors();
      return Number(count);
    },
    enabled: !!actor,
    refetchInterval: 30000,
  });

  const { data: depedVision } = useQuery({
    queryKey: ['depedVision'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDepEdVision();
      } catch (error) {
        console.error('Error fetching DepEd Vision:', error);
        return null;
      }
    },
    enabled: !!actor,
  });

  const { data: depedMission } = useQuery({
    queryKey: ['depedMission'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDepEdMission();
      } catch (error) {
        console.error('Error fetching DepEd Mission:', error);
        return null;
      }
    },
    enabled: !!actor,
  });

  useEffect(() => {
    const recordVisit = async () => {
      if (!actor) return;
      const sessionId = sessionStorage.getItem('visitorSessionId') || `session-${Date.now()}-${Math.random()}`;
      if (!sessionStorage.getItem('visitorSessionId')) {
        sessionStorage.setItem('visitorSessionId', sessionId);
      }
      try {
        await actor.recordVisitor(sessionId);
      } catch (error) {
        console.error('Error recording visitor:', error);
      }
    };
    recordVisit();
  }, [actor]);

  // Measure weather section height on md+ viewports
  useEffect(() => {
    if (!weatherRef.current) return;

    const updateHeight = () => {
      // Only apply height constraint on md+ viewports (768px+)
      if (window.innerWidth >= 768 && weatherRef.current) {
        const height = weatherRef.current.offsetHeight;
        setWeatherHeight(height);
      } else {
        setWeatherHeight(undefined);
      }
    };

    // Initial measurement
    updateHeight();

    // Use ResizeObserver to track changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(weatherRef.current);

    // Also listen to window resize for viewport changes
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Delayed autoplay effect for BNHS Hymn video
  useEffect(() => {
    if (!hymnVideo || !videoRef.current || hasAutoPlayed) return;

    const autoplayTimer = setTimeout(() => {
      if (videoRef.current) {
        // Ensure video is not muted and attempt to play
        videoRef.current.muted = false;
        videoRef.current.play().then(() => {
          setHasAutoPlayed(true);
        }).catch((error) => {
          // If autoplay with sound fails (browser policy), try muted autoplay as fallback
          console.warn('Autoplay with sound blocked, attempting muted autoplay:', error);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch((err) => {
              console.error('Autoplay failed:', err);
            });
          }
        });
      }
    }, 3000); // 3-second delay

    return () => clearTimeout(autoplayTimer);
  }, [hymnVideo, hasAutoPlayed]);

  const formatVisionText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatMissionText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const boldPattern = /\*\*(.*?)\*\*/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={index}>
          {parts.length > 0 ? parts : line}
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <PhilippineTimeClock />
          </div>

          <div className="text-center md:text-right">
            <div className="inline-block rounded-lg bg-[#800000] px-6 py-3 text-white shadow-md">
              <p className="text-lg font-semibold">
                Total Visitors: <span className="text-2xl font-bold">{totalVisitors?.toLocaleString() || 0}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Weather Forecast and Facebook Section - side by side on md+ */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div ref={weatherRef}>
            <WeatherForecastSection />
          </div>
          <div>
            <FacebookPresenceBlock maxHeight={weatherHeight} />
          </div>
        </div>

        <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">School Activities</h2>

        <section className="mb-12">
          <SchoolActivitiesSlider />
        </section>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-8 text-center text-3xl font-bold text-[#800000]">
            DepEd Vision, Mission, Core Values, and Mandates
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-[#800000]">DepEd Vision</h3>
              </div>
              <div className="text-justify text-gray-700">
                {depedVision?.vision ? formatVisionText(depedVision.vision) : (
                  <>
                    We dream of Filipinos<br />
                    who passionately love their country<br />
                    and whose values and competencies<br />
                    enable them to realize their full potential<br />
                    and contribute meaningfully to building the nation.<br />
                    <br />
                    As a learner-centered public institution,<br />
                    the Department of Education<br />
                    continuously improves itself<br />
                    to better serve its stakeholders.
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-bold text-[#800000]">DepEd Mission</h3>
              </div>
              <div className="text-justify text-gray-700">
                {depedMission?.mission ? formatMissionText(depedMission.mission) : (
                  <>
                    To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where:<br />
                    <br />
                    – <strong>Students</strong> learn in a child-friendly, gender-sensitive, safe, and motivating environment.<br />
                    <br />
                    – <strong>Teachers</strong> facilitate learning and constantly nurture every learner.<br />
                    <br />
                    – <strong>Administrators and staff</strong>, as stewards of the institution, ensure an enabling and supportive environment for effective learning to happen.<br />
                    <br />
                    – <strong>Family, community, and other stakeholders</strong> are actively engaged and share responsibility for developing life-long learners.
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <h3 className="text-2xl font-bold text-[#800000]">DepEd Core Values</h3>
              </div>
              <div className="text-justify text-gray-700">
                <p className="mb-2">
                  <strong>Maka-Diyos</strong> - Demonstrates adherence to ethical and spiritual principles
                </p>
                <p className="mb-2">
                  <strong>Maka-tao</strong> - Sensitive to individual, social, and cultural differences
                </p>
                <p className="mb-2">
                  <strong>Makakalikasan</strong> - Cares for the environment and utilizes resources wisely
                </p>
                <p>
                  <strong>Makabansa</strong> - Demonstrates pride in being a Filipino; exercises rights and responsibilities
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ScrollText className="h-8 w-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-[#800000]">DepEd Mandates</h3>
              </div>
              <div className="text-justify text-gray-700">
                {depedVision?.mandates ? formatVisionText(depedVision.mandates) : (
                  <>
                    The Department of Education was established through the Education Decree of 1863 as the Superior Commission of Primary Instruction under a Chairman. The Education agency underwent many reorganization efforts in the 20th century in order to better define its purpose vis a vis the changing administrations and charters. The present day Department of Education was eventually mandated through Republic Act 9155, otherwise known as the Governance of Basic Education act of 2001 which establishes the mandate of this agency.<br />
                    <br />
                    The Department of Education (DepEd) formulates, implements, and coordinates policies, plans, programs and projects in the areas of formal and non-formal basic education. It supervises all elementary and secondary education institutions, including alternative learning systems, both public and private; and provides for the establishment and maintenance of a complete, adequate, and integrated system of basic education relevant to the goals of national development.
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">
          {depedVision?.bnhsStatisticalBulletinTitle || 'Barobo National High School Statistical Bulletin'}
        </h2>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-2 text-center text-3xl font-bold text-[#800000]">
            School at a Glance
          </h2>
          <p className="mb-6 text-center text-lg text-gray-600">
            Key statistics and information about Barobo National High School
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Total Students</h3>
              <p className="text-4xl font-bold">2,450</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Teaching Staff</h3>
              <p className="text-4xl font-bold">85</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Classrooms</h3>
              <p className="text-4xl font-bold">42</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Programs Offered</h3>
              <p className="text-4xl font-bold">12</p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/about/history"
              className="flex flex-col items-center gap-3 rounded-lg bg-[#800000] p-6 text-center text-white transition-colors hover:bg-[#600000]"
            >
              <BookOpen className="h-10 w-10" />
              <span className="text-lg font-semibold">Our History</span>
            </a>
            <a
              href="/about/citizen-charter"
              className="flex flex-col items-center gap-3 rounded-lg bg-[#800000] p-6 text-center text-white transition-colors hover:bg-[#600000]"
            >
              <FileText className="h-10 w-10" />
              <span className="text-lg font-semibold">Citizen Charter</span>
            </a>
            <a
              href="/academics/learning-curriculum"
              className="flex flex-col items-center gap-3 rounded-lg bg-[#800000] p-6 text-center text-white transition-colors hover:bg-[#600000]"
            >
              <GraduationCap className="h-10 w-10" />
              <span className="text-lg font-semibold">Curriculum</span>
            </a>
            <a
              href="/resources/downloadable-forms"
              className="flex flex-col items-center gap-3 rounded-lg bg-[#800000] p-6 text-center text-white transition-colors hover:bg-[#600000]"
            >
              <Download className="h-10 w-10" />
              <span className="text-lg font-semibold">Forms</span>
            </a>
          </div>
        </section>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">School Calendar</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#800000] text-white">
                <span className="text-lg font-bold">01</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">First Quarter</h3>
                <p className="text-sm text-gray-600">August - October</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#800000] text-white">
                <span className="text-lg font-bold">02</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Second Quarter</h3>
                <p className="text-sm text-gray-600">November - December</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#800000] text-white">
                <span className="text-lg font-bold">03</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Third Quarter</h3>
                <p className="text-sm text-gray-600">January - March</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#800000] text-white">
                <span className="text-lg font-bold">04</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fourth Quarter</h3>
                <p className="text-sm text-gray-600">April - June</p>
              </div>
            </div>
          </div>
        </section>

        {hymnVideo && (
          <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">BNHS Hymn</h2>
            <div className="mx-auto max-w-3xl">
              {hymnLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  controls
                  className="w-full rounded-lg shadow-lg"
                  src={hymnVideo.getDirectURL()}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
