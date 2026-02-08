import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, School, Phone, Mail, MapPinned } from 'lucide-react';
import { useGetContactInfoSections, useGetOfficeHoursSections, useGetSchoolHoursSections } from '@/hooks/useQueries';

export default function CitizenCharterPage() {
  const { data: contactInfoSections = [] } = useGetContactInfoSections();
  const { data: officeHoursSections = [] } = useGetOfficeHoursSections();
  const { data: schoolHoursSections = [] } = useGetSchoolHoursSections();

  const defaultContactInfo = `Barobo National High School
Purok 1B Townsite, Poblacion, Barobo, Surigao del Sur, Philippines 8309

Phone: (086) 850 - 0113 (JHS), (086) 850 - 0547 (SHS)
Email: 304861@deped.gov.ph`;

  const defaultOfficeHours = `Monday - Friday
8:00 A.M. - 12:00 P.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)

Saturday - Sunday
Closed`;

  const defaultSchoolHours = `For Junior High School (JHS)
Monday - Friday
7:15 A.M. - 12:00 P.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)
Saturday - Sunday: Closed

For Senior High School (SHS)
Monday - Friday
7:30 A.M. - 11:45 A.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)
Saturday - Sunday: Closed`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5">
      <PageHeader
        title="Citizen's Charter"
        description="School Contact Information and Service Hours"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-school-maroon to-school-maroon-dark text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <MapPinned className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription className="text-white/80">
                    Get in touch with us
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {contactInfoSections.length > 0 ? (
                <div className="space-y-4">
                  {contactInfoSections.map((section) => (
                    <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-school-blue mb-1">Address</p>
                      <p className="text-sm text-muted-foreground">
                        Barobo National High School<br />
                        Purok 1B Townsite, Poblacion<br />
                        Barobo, Surigao del Sur<br />
                        Philippines 8309
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-school-blue mb-1">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        (086) 850 - 0113 (JHS)<br />
                        (086) 850 - 0547 (SHS)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-school-blue mb-1">Email</p>
                      <p className="text-sm text-muted-foreground">304861@deped.gov.ph</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-school-gold to-school-gold-dark text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Office Hours</CardTitle>
                  <CardDescription className="text-white/80">
                    Administrative office schedule
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {officeHoursSections.length > 0 ? (
                <div className="space-y-4">
                  {officeHoursSections.map((section) => (
                    <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-school-blue mb-2">Weekdays</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday<br />
                      8:00 A.M. - 12:00 P.M. (Morning)<br />
                      1:00 P.M. - 5:00 P.M. (Afternoon)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-school-blue mb-2">Weekend</p>
                    <p className="text-sm text-muted-foreground">
                      Saturday - Sunday<br />
                      Closed
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-school-blue to-school-blue-dark text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>School Hours</CardTitle>
                  <CardDescription className="text-white/80">
                    Class and activity schedule
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {schoolHoursSections.length > 0 ? (
                <div className="space-y-4">
                  {schoolHoursSections.map((section) => (
                    <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-school-blue mb-2">Junior High School (JHS)</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday<br />
                      7:15 A.M. - 12:00 P.M. (Morning)<br />
                      1:00 P.M. - 5:00 P.M. (Afternoon)<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-school-blue mb-2">Senior High School (SHS)</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday<br />
                      7:30 A.M. - 11:45 A.M. (Morning)<br />
                      1:00 P.M. - 5:00 P.M. (Afternoon)<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
