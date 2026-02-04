import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function LearningCurriculumPage() {
  return (
    <div>
      <PageHeader
        title="Learning and Curriculum"
        description="Comprehensive curriculum programs and tracks"
        backgroundStyle={{
          backgroundImage: 'url(/assets/generated/academic-programs.dim_400x300.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl text-school-blue">Our Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="spa">
                  <AccordionTrigger className="text-lg font-semibold text-school-blue">
                    Special Program in the Arts (SPA)
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-relaxed text-muted-foreground">
                      The Special Program in the Arts provides students with opportunities to develop their artistic talents in various disciplines including visual arts, performing arts, music, and dance. This program nurtures creativity while maintaining academic excellence.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sptve">
                  <AccordionTrigger className="text-lg font-semibold text-school-blue">
                    Special Program for Technical and Vocational Education (SPTVE)
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-relaxed text-muted-foreground">
                      SPTVE prepares students for technical and vocational careers through hands-on training and industry-relevant skills development. Students gain practical experience in various technical fields.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stem">
                  <AccordionTrigger className="text-lg font-semibold text-school-blue">
                    Special Program for Science (STEM)
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-relaxed text-muted-foreground">
                      The STEM program focuses on Science, Technology, Engineering, and Mathematics, preparing students for careers in these critical fields through advanced coursework and research opportunities.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shs">
                  <AccordionTrigger className="text-lg font-semibold text-school-blue">
                    Senior High School Curriculum
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold text-school-blue">Academic Track</h4>
                        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                          <li>
                            <strong>Humanities and Social Sciences (HUMSS)</strong> - Focuses on human behavior, societal issues, and communication
                          </li>
                          <li>
                            <strong>Accountancy, Business, and Management (ABM)</strong> - Prepares students for business and financial careers
                          </li>
                          <li>
                            <strong>Science, Technology, Engineering, and Mathematics (STEM)</strong> - Advanced science and mathematics preparation
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold text-school-blue">TVL Track</h4>
                        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                          <li>
                            <strong>Home Economics</strong> - Specializations in Cookery and Beauty Care
                          </li>
                          <li>
                            <strong>Information Technology</strong> - Computer System Servicing specialization
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
