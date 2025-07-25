import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import RegisterForm from '../RegisterForm'; // Adjust path as needed

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const tabs = [
  {
    label: "About MET",
    content:
      "Just a stone's throw away from the Arabian Sea, is an institution that is creating waves. Because, it is quite simply, a cut above the rest. The MET League of Colleges is a conglomerate of premiere educational institutions, driven by a single-minded focus on imparting quality education to make students sharp. Established in 1989, with a mission to redefine the system of education, Mumbai Educational Trust (MET) is a professionally managed, multi-disciplinary and multi-faceted oasis of knowledge. Its premiere educational institutes conduct university accredited and autonomous courses. The grant of the ISO 9001:2015 certification is an acknowledgement of the institution's capability to deliver professional education that meets the highest standards of professionalism worldwide. All this, to help young professionals face the challenges of life. And make their mark in the corporate world. Training is imparted round-the-clock, seven days a week. Projects and assignments are given utmost importance and students learn on the job. Application-oriented knowledge, garnered in the lecture halls, is applied to industry assignments. The faculty spares no effort to make the students razor sharp, so that they make their mark in the corporate world. No effort has been spared, to create an environment that encourages students, to push the limits of their minds. At MET thousands of students and faculty are involved in delivering unique learning systems, through ultra-modern infrastructure and academic rigour. MET Institutes are ISO certified, with affiliations to the University of Mumbai, Directorate of Technical Education, All India Council of Technical Education, MSBTE, Pharmacy Council of India, C-DAC - Ministry of Communications and Information Technology and The Chartered Insurance Institute (CII), London. MET is a recognised teaching centre of awarding body University of London and also has strategic institutional collaborations with the NCC Education, UK. There are about 21 institutes housed in state-of-the-art campuses located in Mumbai and Nashik."
  },
  {
    label: "About MET IMM",
    content:
      "Established in 2005, MET Institute of Mass Media has grown into a prestigious institution at the forefront of Mass Communication and Media Management education in India under the 37 years rich legacy of Mumbai Educational Trust which is a professionally managed, multi-disciplinary and multi-faceted oasis of academic and professional knowledge. With a philosophy grounded in the 3A of Media Education – Acquire, Assemble, and Apply – MET Institute of Mass Media focuses on blending academic insight with real-world application to shape the media leaders of tomorrow. MET has consistently received accolades for its academic excellence and innovative pedagogy. It was conferred the title of ‘Outstanding Institute for Mass Media Management of the Year’ at the World Education Summit Awards 2019, and ranked 4th Best in Advertising & PR and 9th Best Post Graduate Media School in India by the Edutainment Awards 2017. In recognition of its commitment to inclusive learning, MET received the Unity in Diversity Educational Institute Award by the Global Dialogue Foundation and United Nations Alliance of Civilizations (UNAOC) in 2016. Adding to its list of achievements, MET Institute of Mass Media was recently awarded the prestigious DIAMOND Rating by QS I-GAUGE (Indian College Ratings) in 2025– a testament to its performance against rigorous quality benchmarks in higher education. Our PG programme is among the top-ranked specialized offerings among emerging B-Schools, as per The Times of India. The institute’s strategic collaboration with prominent media organisations in India enriches the curriculum with valuable industry exposure. MET Institute of Mass Media features cutting-edge facilities, including a fully operational in-house studio complex, media-centric classrooms, and a comprehensive library. Over the past two decades, the institute has cultivated a strong alumni network, with professionals working across top-tier organizations in the media ecosystem. Our students have recently secured placements with renowned media firms such as Jio Creative Labs, Zee Entertainment, Scarecrow, Madison World, ABP News, Laqshya Media, VMLY&R, Famous Innovations, Rajshree Entertainment, The Times of India, Lodestar, and SoCheers, etc. highlighting the institution’s strong industry interface and focus on employability. A dedicated Career Management Centre supports students from admission to final placement, providing personalized mentorship, certification pathways, and access to a powerful alumni network. The exclusive alumni portal ensures lifelong access to professional connections, resources, and opportunities across media and communication domains. With its stellar record, forward-thinking pedagogy, and deep industry integration, MET IMM continues to shape future-ready professionals equipped to lead in a dynamic global media environment."
  },
  {
    label: "About the Conference",
    content:
      "In an age marked by unprecedented technological disruption, the landscape of media and communication is undergoing a fundamental transformation. This Media Research Conference brings together media professionals, scholars, students, and industry leaders to explore the evolving intersection of emerging technologies and media ecosystems. From smarter content recommendations and interactive storytelling to immersive experiences and real-time audience feedback, emerging technologies are changing the way stories are told and shared. Innovations like AI, smart devices, immersive media, and digital trust systems are transforming newsrooms, reimagining entertainment formats, influencing public opinion, and challenging traditional norms of media ethics and audience engagement. These shifts are prompting new questions about how media is created, circulated, and experienced in today's connected world. The media industry is witnessing a paradigm shift as Digital Communication tools redefine interactions between brands, consumers, content creators, and communities. Real-time engagement, personalized content delivery, and data-driven media strategies have empowered organizations to break traditional barriers and deliver inclusive, culturally relevant, and globally scalable communication solutions. Social media platforms, OTT streaming services, and digital journalism have not only disrupted traditional media models but have also democratized content creation and access. With the growing ability to collect and analyse vast volumes of Media data, decision-making in content development, audience segmentation, advertising effectiveness, and platform optimization has become more evidence-based. Advanced analytics and AI-powered tools now allow media professionals to predict consumer behaviour, measure sentiment, and refine campaign strategies with precision. Governments, NGOs, and public communicators are also harnessing these tools to craft impactful media messages that drive awareness, policy change, and civic engagement. Technology’s transformative power in media is also fostering Economic growth and employment through the rise of digital content creation, influencer marketing, immersive experiences, and virtual production techniques. Fintech-media collaborations have further enabled micro-monetization models, expanding financial inclusion and content accessibility to underserved populations. A rising focus on Sustainable Media practices such as green production methods, digital minimalism, and ethical advertising is guiding the industry towards more responsible storytelling. Audiences and regulators alike are urging media platforms to reduce their environmental and psychological footprints while promoting awareness of critical issues like climate change, inclusion, and social justice. Simultaneously, media organizations are investing in Tech-enabled learning platforms to equip professionals with future-ready skills. E-learning modules, interactive webinars, AI-personalized training, and hybrid classrooms are bridging global skill gaps and preparing talent for evolving media landscapes. These advancements are also democratizing media education, enabling learners from remote and marginalized communities to participate in global knowledge networks. Yet, as media and technology become increasingly intertwined, Ethical challenges surface. Issues such as misinformation, deepfakes, cyber threats, data surveillance, and algorithmic bias demand critical inquiry and regulatory frameworks. The conference aims to spark dialogue around these complexities, urging scholars, practitioners, and policy makers to explore ethical, inclusive, and equitable approaches to media innovation. This Media Research Conference hosted by MET Institute of Mass Media invites thought leaders, researchers, educators, industry professionals, and students to engage in meaningful discourse, share insights, and co-create knowledge on how technology is shaping the future of media and communication in society."
  }
];

const Countdown = () => {
  const targetDate = new Date("2025-09-20T09:30:00").getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="text-center bg-red-50 p-4 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Countdown to Conference Day</h3>
      <div className="flex justify-center gap-6 text-gray-700 font-medium">
        <div>{days}d</div>
        <div>{hours}h</div>
        <div>{minutes}m</div>
        <div>{seconds}s</div>
      </div>
    </div>
  );
};

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full text-left py-3 px-4 font-semibold text-red-600 hover:bg-red-50 transition flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const ConferenceLandingPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetch(`/api/events/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Event not found');
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load event: ${slug}`, err);
        // Fallback to static content if API fails
        setEvent({ id: 'default-conference-id' }); // Placeholder ID for RegisterForm
        setLoading(false);
      });
  }, [navigate, slug]);

  if (loading) return <div className="p-6 text-center animate-pulse text-red-600">Loading...</div>;
  if (!event) return <div className="p-6 text-center text-red-600">Event not found.</div>;

  return (
    <>
      <header className="fixed w-full bg-white z-50 shadow">
        <nav className="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img
              src="https://www.met.edu/frontendassets/images/MET_College_in_Mumbai_logo.png"
              alt="MET Logo"
              className="h-10 md:h-14"
            />
          </a>
          <button
            onClick={() => {
              document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-red-600 text-white px-5 py-2 rounded-md text-sm md:text-base font-medium hover:bg-red-700"
          >
            Register Now
          </button>
        </nav>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white min-h-screen pt-28 pb-10 px-4 md:px-10 text-gray-800"
      >
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
              International Research Conference on Mass Communication and Media Management
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-1">Multidisciplinary | Hybrid Mode</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-700 text-sm md:text-base">
              <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-red-500" /> 20th September 2025</div>
              <div className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-red-500" /> 9:30 AM to 5:00 PM</div>
              <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-red-500" /> MET Institute of Mass Media</div>
            </div>
          </div>

          <Countdown />

          <div className="flex gap-4 flex-wrap justify-center mb-6">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition ${
                  activeTab === i ? "bg-red-600 text-white border-red-600" : "border-red-600 text-red-600 hover:bg-red-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold text-red-600 mb-3">{tabs[activeTab].label}</h2>
            <p className="text-justify leading-relaxed text-gray-700">{tabs[activeTab].content}</p>
          </motion.div>

          <div className="space-y-8">
            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Theme</h2>
              <p className="text-gray-700">Voices of Change: Harnessing Media to Transform the World</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Purpose</h2>
                <p className="text-justify leading-relaxed text-gray-700">
                  The purpose of this International Research Conference is to create a collaborative platform for scholars, media professionals, and policymakers to engage in meaningful dialogue on the transformative impact of technology on media practices, communication trends, and societal narratives. In an era where digital advancements are reshaping content creation, distribution, and consumption at an unprecedented pace, this conference aims to spotlight both the opportunities and challenges presented by these changes. It seeks to foster interdisciplinary research and critical knowledge exchange that will enable participants to explore how emerging media technologies can be strategically managed to enrich storytelling, elevate audience engagement, and strengthen democratic discourse. Harnessing the power of media technology involves not just adopting new tools but ensuring their responsible use in alignment with the broader goals of ethical communication, inclusivity, and sustainable societal growth. By embedding ethical frameworks into the development, dissemination, and governance of media content and platforms, we can safeguard public trust and reinforce the role of media as a force for positive change.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Key Objectives</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Explore evolving media practices driven by technological innovation and examine how media organizations and content creators are adapting to enhance communication effectiveness and address critical societal concerns.</li>
                  <li>Foster collaboration between media scholars, professionals, academicians, and students to bridge the gap between academic research and real-world media practices.</li>
                  <li>Provide a dynamic platform for the exchange of ideas, case studies, and best practices on the role of technology in transforming journalism, advertising, entertainment, public relations, and digital media landscapes.</li>
                  <li>Encourage and promote research among academicians, media researchers, students, and industry thought leaders to contribute to the growth of ethical, inclusive, and impactful media.</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Highlights</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Publication:</strong> Selected full papers will be published in a Peer-Reviewed Research Journal, subject to author approval and meeting publication guidelines.</li>
                  <li><strong>Paper Presentation:</strong> Hybrid Mode (Offline + Online).</li>
                  <li><strong>Awards and Recognitions:</strong> Best Paper Award for each track.</li>
                  <li><strong>Learning Opportunity:</strong> Immense learning opportunities from keynote talks, workshops, panel discussions, and research paper presentations.</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Patrons</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Shri. Pankaj Bhujbal (Honourable Trustee - MET)</li>
                  <li>Dr. Suvrashis Sarkar (Dean - MET Institute of Mass Media)</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Industry Advisory Committee</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Mr. Bobby Pawar (Former Chairman and CCO - Havas Group)</li>
                  <li>Mr. Mahesh Chauhan (Founder Director - Salt Brand Solutions)</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Management</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Convenor:</strong> Dr. Suvrashis Sarkar (Dean - MET IMM)</li>
                  <li><strong>Co-Convenor:</strong> Dr. Yogesh Dhanjani (Associate Professor – MET IMM)</li>
                  <li><strong>Co-Convenor:</strong> Mr. Pritesh Shinde (Assistant Professor – MET IMM)</li>
                </ul>
              </section>
            </div>

            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Call for Research Papers</h2>
              <p className="text-justify leading-relaxed text-gray-700 mb-4">
                Abstracts up to 300 words based on qualitative and quantitative research papers, case studies, or working papers are invited from industry practitioners, academicians, research scholars, consultants, and students on the following themes. The sub-themes are indicative but not exhaustive:
              </p>
              <p>
                Research Papers should focus on the following areas:
              </p>
              <div className="space-y-2">
                <Accordion title="Digital Persuasion: Marketing in the Era of AI & Data-Driven World">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Navigating Mis-information and Dis-information in the Digital Era</li>
                    <li>Ethics of AI in Newsrooms and Marketing Content Creation</li>
                    <li>Hyper Personalization in Digital Marketing</li>
                    <li>Impact of Algorithm-Driven Content on Public Opinion</li>
                    <li>Media in the Age of Disruption: Innovation, Ethics and Influence</li>
                    <li>Digital Marketing and Influencer Economy in the Age of AI</li>
                    <li>AI-Driven Personalization & Customer Experience in Modern Marketing</li>
                    <li>Omni channel and Multichannel Marketing</li>
                    <li>Conscious Consumerism and Ethics in Marketing</li>
                    <li>Role of AI in Designing and Delivering Choice Architecture to Consumers</li>
                    <li>Cross Cultural Consumer Behaviour and Global Branding Using Technology</li>
                  </ul>
                </Accordion>
                <Accordion title="Selling Stories: Emotions, Ethics & Engagement in Modern Advertising">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Role of Advertising in Promoting Literacy and Awareness</li>
                    <li>The Psychology of Ads That Made You Buy: Breaking Down Viral Campaigns</li>
                    <li>Usage of Neuromarketing in Advertisements</li>
                    <li>Ad Fatigue in the Digital Age: How Much is Too Much?</li>
                    <li>The Rise of Silent Advertising: Effectiveness in a Sound-Off World</li>
                    <li>Influencer vs. Traditional Advertising: Who Holds More Power Today?</li>
                    <li>Advertising in Gaming Ecosystems: The Untapped Attention Economy</li>
                    <li>Artificial Intelligence: Ethical Dilemmas and Responsible Use in Advertising</li>
                    <li>Governance and Regulation of Emerging Technologies</li>
                    <li>Inclusivity in Indian Advertisements: Tokenism or True Representation?</li>
                    <li>Sustainability Sells: The Rise of Green Advertising and Conscious Consumerism</li>
                  </ul>
                </Accordion>
                <Accordion title="The Entertainment Shift: Power, Platforms & Participation">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Streaming Wars: How OTT Platforms Are Reshaping Indian Entertainment</li>
                    <li>Cinema and Social Change: Film as a Tool for Cultural Conversation</li>
                    <li>Rise of Short-Form Content: Has Entertainment Lost Its Attention Span?</li>
                    <li>The Impact of Fan Culture on Narrative Decisions in Franchises</li>
                    <li>Virtual Reality in Entertainment: Fad or the Future of Immersive Content?</li>
                    <li>Rise of Regional OTT Platforms and Hyperlocal Storytelling</li>
                    <li>Memes, Reels, and Reaction Videos: How User-Generated Content Reinvents Pop Culture</li>
                    <li>AI in Scriptwriting and Animation: Enhancing Creativity or Replacing Creators?</li>
                    <li>The Gamification of Entertainment: How Games Are Redefining Audience Engagement</li>
                    <li>Post-COVID Consumption: Are Cinemas Still Relevant in the OTT Era?</li>
                    <li>Decoding the Psychology of Binge-Watching: Implications for Content Creators</li>
                  </ul>
                </Accordion>
                <Accordion title="Narrating the Now: Innovative Techniques in Modern-Day Journalism">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>AI in the Newsroom: Threat or Tool for Journalistic Integrity?</li>
                    <li>The Evolution of Political Journalism in the Age of Polarized Media</li>
                    <li>Digital Trauma: Mental Health of Journalists Covering Conflict and Crisis</li>
                    <li>Paywalls and Public Interest: The Economics of Journalism in the Digital Era</li>
                    <li>Citizen Journalism and Crisis Reporting: Boon or Chaos?</li>
                    <li>Social Media as a News Source: Journalism or Gossip?</li>
                    <li>Photojournalism in Crisis: Authenticity, Consent, and Visual Manipulation</li>
                    <li>Impact of Deepfakes and Synthetic Media on News Trustworthiness</li>
                    <li>Fact-Checking Fatigue: Are Audiences Tired of Truth?</li>
                    <li>The Role of Regional Language Journalism in Building Media Literacy</li>
                    <li>Clickbait vs. Credibility: The Battle for Ethical Journalism</li>
                  </ul>
                </Accordion>
                <Accordion title="Reimagining Learning: The Media Education Nexus in Digital Age">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Digital Pedagogies & Media Integration</li>
                    <li>Media Literacy in Classroom</li>
                    <li>EdTech Innovation: From Chalkboards to Chatbots</li>
                    <li>The Role of Social Media in Academic Discourse</li>
                    <li>Hybrid Learning & Media Dynamics</li>
                    <li>Gamification & Edutainment</li>
                    <li>Educational Journalism</li>
                    <li>Cinema & Curriculums</li>
                    <li>Media Ethics & Responsibility in Educational Context</li>
                    <li>Inclusivity Through Educational Media</li>
                    <li>AI, Personalization & Future of Learning Media</li>
                  </ul>
                </Accordion>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Important Dates</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Submission of Abstract (300 words limit): 10th August 2025</li>
                  <li>Announcement of Acceptance of Abstract: 25th August 2025</li>
                  <li>Last Date for Full Paper Submission: 8th September 2025</li>
                  <li>Last Date of Registration: 15th September 2025</li>
                  <li>Conference Day (Paper Presentation): 20th September 2025</li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Submission Guidelines</h2>
                <p className="text-justify leading-relaxed text-gray-700">
                  <strong>Eligibility and Scope:</strong> All submissions should be original and not previously published or under consideration elsewhere. They must align with the conference's themes and topics.
                  <br />
                  <strong>Submission Platform:</strong> Abstracts up to 300 words must be submitted by email. Authors must submit the abstract in Font Size and Style: 12 Times New Roman with Single Line spacing. Extended Abstracts must contain the context of the study, research objective, research methodology adopted, key findings, and practical implications. Abstract must include a maximum of five keywords. Abstracts should be in past tense. Authors may also submit an abstract of work in progress, case study, or industry papers for presentation and would be included in the conference compendium.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Registration / Participation Fees</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Academicians and Research Scholars (Offline Mode Presentation):</strong> Rs. 2000.00 (per author) includes paper publication charges in a peer-reviewed online journal; Rs. 2000.00 (per additional authors) includes paper publication charges.</li>
                  <li><strong>Academicians and Research Scholars (Online Mode Presentation):</strong> Rs. 1500.00 (per author) includes paper publication charges in a peer-reviewed online journal; Rs. 1500.00 (per additional authors) includes paper publication charges.</li>
                  <li><strong>Academicians and Research Scholars (Participation Only):</strong> Rs. 1000.00 (per participant).</li>
                  <li><strong>Industry Professional (Paper Presentation):</strong> Rs. 2500.00 (per presenter) offline and online.</li>
                  <li><strong>Industry Professional (Participation Only):</strong> Rs. 1000.00 (per participant).</li>
                  <li><strong>International Participant:</strong> USD 50 (per participant).</li>
                  <li><strong>Student Participant (up to three authors per paper):</strong> Rs. 800.00 (per student).</li>
                </ul>
                <p className="mt-4 text-gray-700"><strong>Mode of Payment:</strong> QR Code for fee payment is required.</p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <p>Email: <a href="mailto:conference_imm@met.edu" className="text-red-600 hover:underline">conference_imm@met.edu</a></p>
                  <div>
                    <p>Phone:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>022-39554272, 8208132465 (Dr. Suvrashis Sarkar)</li>
                      <li>022-39554384, 9820531669 (Dr. Yogesh Dhanjani)</li>
                      <li>022-39554275, 96192255358 (Prof. Pritesh Shinde)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Venue</h2>
                <p className="text-gray-700">MET Institute of Mass Media, MET Bhujbal Knowledge City, Bandra Reclamation, Bandra (W), Mumbai - 400050</p>
              </section>
            </div>

            <div id="register-form" className="pt-6">
              <h2 className="text-center text-2xl font-semibold text-red-600 mb-4">Register Now</h2>
              <RegisterForm eventId={event.id.toString()} />
            </div>
          </div>
        </div>
      </motion.div>

      <footer className="bg-gray-100 py-6 px-4 text-center text-sm mt-10">
        © 2025 MET Institute of Mass Media. All rights reserved.
      </footer>
    </>
  );
};

export default ConferenceLandingPage;