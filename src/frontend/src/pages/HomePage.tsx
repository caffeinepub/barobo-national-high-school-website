import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import PhilippineTimeClock from '../components/PhilippineTimeClock';
import WeatherForecastSection from '../components/WeatherForecastSection';
import FacebookPresenceBlock from '../components/FacebookPresenceBlock';
import SchoolActivitiesSlider from '../components/SchoolActivitiesSlider';
import { Eye, Target, Star, BookOpen, FileText, GraduationCap, Download, ScrollText, Loader2, Users, Volume2, MapPin, Clock, School } from 'lucide-react';
import { useGetBNHSHymnVideo, useGetCitizenCharterBackgroundPublic, useGetCitizenCharterStaticImagePublic } from '../hooks/useQueries';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage() {
  const { actor } = useActor();
  const { data: hymnVideo, isLoading: hymnLoading } = useGetBNHSHymnVideo();
  const { data: citizenCharterBackground } = useGetCitizenCharterBackgroundPublic();
  const { data: citizenCharterStaticImage } = useGetCitizenCharterStaticImagePublic();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasAttemptedAutoplay, setHasAttemptedAutoplay] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const weatherRef = useRef<HTMLDivElement>(null);
  const [weatherHeight, setWeatherHeight] = useState<number | undefined>(undefined);
  const [backgroundImageError, setBackgroundImageError] = useState(false);
  const [staticImageError, setStaticImageError] = useState(false);

  // Memoize the hymn video URL to prevent src changes during playback
  // Only changes when the underlying blob object identity changes
  const hymnVideoUrl = useMemo(() => {
    if (!hymnVideo) return null;
    return hymnVideo.getDirectURL();
  }, [hymnVideo]);

  // Memoize Citizen Charter images with cache-busting
  const citizenCharterBackgroundUrl = useMemo(() => {
    if (!citizenCharterBackground) return null;
    const baseUrl = citizenCharterBackground.getDirectURL();
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }, [citizenCharterBackground]);

  const citizenCharterStaticImageUrl = useMemo(() => {
    if (!citizenCharterStaticImage) return null;
    const baseUrl = citizenCharterStaticImage.getDirectURL();
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }, [citizenCharterStaticImage]);

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

  // Single deterministic autoplay attempt for BNHS Hymn video
  // Only runs once per page load when video URL becomes available
  useEffect(() => {
    if (!hymnVideoUrl || !videoRef.current || hasAttemptedAutoplay) return;

    const autoplayTimer = setTimeout(() => {
      if (videoRef.current) {
        // Mark that we've attempted autoplay to prevent repeated attempts
        setHasAttemptedAutoplay(true);
        
        // Attempt to play with sound
        videoRef.current.muted = false;
        videoRef.current.play()
          .then(() => {
            // Autoplay with sound succeeded
            setAutoplayFailed(false);
          })
          .catch((error) => {
            console.warn('Autoplay with sound blocked by browser:', error);
            // Show user message instead of trying muted autoplay
            setAutoplayFailed(true);
          });
      }
    }, 3000); // 3-second delay

    return () => clearTimeout(autoplayTimer);
  }, [hymnVideoUrl, hasAttemptedAutoplay]);

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

        {/* Welcome and Faculty Section */}
        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Column: Welcome and Principal */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-[#800000]">
                  Welcome to Barobo National High School Website!
                </h2>
                <p className="text-justify text-gray-700 leading-relaxed">
                  Empowering students to reach their full potential through excellence in education, character development, and community engagement. Committed to providing quality education and nurturing future leaders in our community through excellence in teaching and learning.
                </p>
              </div>

              {/* Principal Profile */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src="/assets/generated/principal-photo.dim_600x600.png"
                      alt="School Principal - Rachel Methuselah R. Cumahig, PhD"
                      className="w-full md:w-48 h-auto rounded-lg shadow-md object-cover"
                    />
                    <div className="mt-3 text-center">
                      <p className="font-semibold text-gray-900">Rachel Methuselah R. Cumahig, PhD</p>
                      <p className="text-sm text-[#800000] font-medium">Principal IV</p>
                    </div>
                  </div>

                  {/* Principal Message */}
                  <div className="flex-1">
                    <h3 className="mb-3 text-lg font-bold text-[#800000]">Principal's Message</h3>
                    <p className="text-justify text-gray-700 leading-relaxed">
                      Welcome to Barobo National High School! As Principal, I am honored to lead this institution dedicated to academic excellence and holistic student development. Our commitment is to provide a nurturing environment where every student can thrive, discover their potential, and become responsible citizens of our nation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Faculty and Staff */}
            <div className="space-y-6">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#800000]" />
                  <h2 className="text-2xl font-bold text-[#800000]">
                    Our Dedicated Faculty of JHS, SHS and Staff of Barobo National High School
                  </h2>
                </div>
                <div className="mb-4">
                  <img
                    src="/assets/generated/faculty-staff-group.dim_1600x900.png"
                    alt="Dedicated Faculty of JHS, SHS and Staff of Barobo National High School"
                    className="w-full h-auto rounded-lg shadow-md object-cover"
                  />
                </div>
                <p className="text-justify text-gray-700 leading-relaxed">
                  Our school is proud to have a team of dedicated, qualified, and passionate educators who are committed to student success. Our faculty members bring years of experience and expertise to the classroom.
                </p>
                <p className="mt-4 text-justify text-gray-700 leading-relaxed">
                  Through continuous professional development and training, our teachers stay updated with the latest educational methodologies and technologies to provide the best learning experience for our students.
                </p>
              </div>
            </div>
          </div>
        </section>

        <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">School Activities</h2>

        <section className="mb-12">
          <SchoolActivitiesSlider />
        </section>

        {/* Citizen Charter Section */}
        {(citizenCharterBackgroundUrl || citizenCharterStaticImageUrl) && (
          <section className="mb-12">
            <div
              className="relative rounded-lg overflow-hidden shadow-md"
              style={
                citizenCharterBackgroundUrl && !backgroundImageError
                  ? {
                      backgroundImage: `linear-gradient(rgba(128, 0, 0, 0.7), rgba(128, 0, 0, 0.7)), url(${citizenCharterBackgroundUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: '#800000' }
              }
            >
              {citizenCharterBackgroundUrl && (
                <img
                  src={citizenCharterBackgroundUrl}
                  alt=""
                  className="hidden"
                  onError={() => setBackgroundImageError(true)}
                />
              )}
              <div className="p-8 text-white">
                <h2 className="mb-4 text-center text-3xl font-bold">Citizen's Charter</h2>
                <p className="text-center text-lg mb-6">School Contact Information and Service Hours</p>
                
                {citizenCharterStaticImageUrl && !staticImageError && (
                  <div className="mb-6 mx-auto max-w-5xl">
                    <img
                      src={citizenCharterStaticImageUrl}
                      alt="Citizen Charter Information"
                      className="w-full h-auto rounded-lg shadow-lg"
                      onError={() => setStaticImageError(true)}
                    />
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
                  <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 text-white">
                        <MapPin className="h-6 w-6" />
                        <CardTitle className="text-white">Contact Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-white/90">
                      <p className="text-sm">
                        Barobo National High School<br />
                        Purok 1B Townsite, Poblacion<br />
                        Barobo, Surigao del Sur<br />
                        Philippines 8309<br />
                        <br />
                        Phone: (086) 850 - 0113 (JHS)<br />
                        (086) 850 - 0547 (SHS)<br />
                        Email: 304861@deped.gov.ph
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 text-white">
                        <Clock className="h-6 w-6" />
                        <CardTitle className="text-white">Office Hours</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-white/90">
                      <p className="text-sm">
                        Monday - Friday<br />
                        8:00 A.M. - 12:00 P.M. (Morning)<br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)<br />
                        <br />
                        Saturday - Sunday<br />
                        Closed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 text-white">
                        <School className="h-6 w-6" />
                        <CardTitle className="text-white">School Hours</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-white/90">
                      <p className="text-sm">
                        <strong>JHS:</strong> Mon-Fri<br />
                        7:15 A.M. - 5:00 P.M.<br />
                        <br />
                        <strong>SHS:</strong> Mon-Fri<br />
                        7:30 A.M. - 5:00 P.M.<br />
                        <br />
                        Sat-Sun: Closed
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* BNHS Hymn Section */}
        {hymnVideoUrl && (
          <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">BNHS Hymn</h2>
            {autoplayFailed && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Volume2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Click the play button below to start the BNHS Hymn video with sound.
                </AlertDescription>
              </Alert>
            )}
            <div className="mx-auto max-w-4xl">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                <video
                  ref={videoRef}
                  src={hymnVideoUrl}
                  controls
                  className="h-full w-full"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </section>
        )}

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
              <p className="mt-2 text-sm opacity-90">Enrolled for SY 2024-2025</p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Teaching Staff</h3>
              <p className="text-4xl font-bold">98</p>
              <p className="mt-2 text-sm opacity-90">Dedicated educators</p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Classrooms</h3>
              <p className="text-4xl font-bold">65</p>
              <p className="mt-2 text-sm opacity-90">Modern learning spaces</p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Programs Offered</h3>
              <p className="text-4xl font-bold">8</p>
              <p className="mt-2 text-sm opacity-90">Specialized tracks</p>
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">Quick Links</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/about/history"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <BookOpen className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">School History</h3>
                <p className="text-sm text-gray-600">Learn about our heritage</p>
              </div>
            </a>

            <a
              href="/about/organizational-structure"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <Users className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">Organizational Structure</h3>
                <p className="text-sm text-gray-600">Meet our leadership</p>
              </div>
            </a>

            <a
              href="/paps/learning-curriculum"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <GraduationCap className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">Learning Curriculum</h3>
                <p className="text-sm text-gray-600">Explore our programs</p>
              </div>
            </a>

            <a
              href="/about/citizen-charter"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <FileText className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">Citizen's Charter</h3>
                <p className="text-sm text-gray-600">Service information</p>
              </div>
            </a>

            <a
              href="/paps/downloadable-forms"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <Download className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">Downloadable Forms</h3>
                <p className="text-sm text-gray-600">Access school forms</p>
              </div>
            </a>

            <a
              href="/about/alumni"
              className="group flex items-center gap-4 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5"
            >
              <Users className="h-8 w-8 text-[#800000]" />
              <div>
                <h3 className="font-bold text-[#800000] group-hover:underline">Alumni</h3>
                <p className="text-sm text-gray-600">Connect with graduates</p>
              </div>
            </a>
          </div>
        </section>

        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">School Calendar</h2>
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-lg border">
              <img
                src="/assets/generated/calendar-header.dim_800x200.jpg"
                alt="School Calendar"
                className="w-full"
              />
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-shrink-0 rounded bg-[#800000] px-3 py-2 text-center text-white">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-xs">JAN</div>
                </div>
                <div>
                  <h3 className="font-bold text-[#800000]">Enrollment Period Begins</h3>
                  <p className="text-sm text-gray-600">Start of enrollment for incoming students</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-shrink-0 rounded bg-[#800000] px-3 py-2 text-center text-white">
                  <div className="text-2xl font-bold">05</div>
                  <div className="text-xs">FEB</div>
                </div>
                <div>
                  <h3 className="font-bold text-[#800000]">First Day of Classes</h3>
                  <p className="text-sm text-gray-600">Opening of School Year 2024-2025</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-shrink-0 rounded bg-[#800000] px-3 py-2 text-center text-white">
                  <div className="text-2xl font-bold">20</div>
                  <div className="text-xs">MAR</div>
                </div>
                <div>
                  <h3 className="font-bold text-[#800000]">Intramurals Week</h3>
                  <p className="text-sm text-gray-600">Annual sports and cultural activities</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
