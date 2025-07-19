import React, { useState } from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const tabs = [
  {
    label: "About MET",
    content:
      "Just a stone's throw away from the Arabian Sea, MET League of Colleges is creating waves as a conglomerate of premier educational institutions driven by a mission to redefine education. Established in 1989, Mumbai Educational Trust (MET) is a professionally managed, multi-disciplinary, and multi-faceted oasis of knowledge. Its institutes conduct university-accredited and autonomous courses, with ISO 9001:2015 certification acknowledging its capability to deliver professional education meeting global standards. MET is affiliated with the University of Mumbai, Directorate of Technical Education, AICTE, MSBTE, Pharmacy Council of India, C-DAC, and The Chartered Insurance Institute (CII), London. It is a recognized teaching center of the University of London and collaborates with NCC Education, UK. With 21 institutes across state-of-the-art campuses in Mumbai and Nashik, MET provides round-the-clock training, emphasizing application-oriented learning through industry assignments and academic rigor to prepare students for corporate challenges."
  },
  {
    label: "About MET IMM",
    content:
      "Established in 2005 under the 37-year legacy of Mumbai Educational Trust, MET Institute of Mass Media is a prestigious institution at the forefront of Mass Communication and Media Management education in India. Grounded in the 3A philosophy of Media Education – Acquire, Assemble, and Apply – it blends academic insight with real-world application to shape tomorrow’s media leaders. MET IMM has earned accolades including the ‘Outstanding Institute for Mass Media Management’ at the World Education Summit Awards 2019, 4th Best in Advertising & PR, and 9th Best Post Graduate Media School in India by the Edutainment Awards 2017. It received the Unity in Diversity Educational Institute Award by the Global Dialogue Foundation and United Nations Alliance of Civilizations in 2016, and a DIAMOND Rating by QS I-GAUGE in 2025. With top-ranked PG programs, strategic industry collaborations, cutting-edge facilities like an in-house studio, and a strong alumni network, MET IMM secures placements with firms like Jio Creative Labs, Zee Entertainment, and The Times of India. Its Career Management Centre and exclusive alumni portal ensure lifelong professional support."
  },
  {
    label: "About the Conference",
    content:
      "In an era of unprecedented technological disruption, this International Research Conference explores the evolving intersection of emerging technologies and media ecosystems. It brings together media professionals, scholars, students, and industry leaders to discuss how innovations like AI, smart devices, immersive media, and digital trust systems are transforming newsrooms, entertainment, public opinion, and media ethics. The conference addresses digital communication’s impact on brands, consumers, and communities, the role of data analytics in content development, and the rise of sustainable media practices. It also tackles ethical challenges like misinformation, deepfakes, and algorithmic bias. The conference fosters interdisciplinary dialogue to harness media technology for ethical, inclusive, and impactful storytelling, with keynote addresses, expert panels, paper presentations, and academic networking. Selected papers will be published in a peer-reviewed journal, and each track will feature a Best Paper Award."
  }
];

const Countdown = () => {
  const targetDate = new Date("2025-09-20T09:30:00").getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());

  React.useEffect(() => {
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
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white text-gray-800">
      <header className="bg-gray-100 py-6 px-4 md:px-12 shadow-md">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-bold text-red-600 text-center"
        >
          International Research Conference on Mass Communication and Media Management
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7 }}
          className="text-center text-sm md:text-base mt-2 font-medium"
        >
          Multidisciplinary | Hybrid Mode
        </motion.p>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          className="text-center mt-1 font-semibold"
        >
          20 September 2025 | 9:30 AM – 5:00 PM
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.9 }}
          className="flex justify-center mt-4"
        >
          <a
            href="https://forms.gle/XqaGoi292Bcqihi67"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition"
          >
            Register Now
          </a>
        </motion.div>
      </header>

      <div className="px-4 md:px-12">
        <Countdown />
      </div>

      <main className="px-4 md:px-12 py-10">
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

        <div className="mt-12 space-y-8">
          <section className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Theme</h2>
            <p className="text-gray-700">Voices of Change: Harnessing Media to Transform the World</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Purpose</h2>
              <p className="text-justify leading-relaxed text-gray-700">
                The purpose of this International Research Conference is to create a collaborative platform for scholars, media professionals, and policymakers to engage in meaningful dialogue on the transformative impact of technology on media practices, communication trends, and societal narratives. In an era where digital advancements are reshaping content creation, distribution, and consumption, this conference aims to spotlight both opportunities and challenges. It seeks to foster interdisciplinary research and critical knowledge exchange to explore how emerging media technologies can enrich storytelling, elevate audience engagement, and strengthen democratic discourse. By embedding ethical frameworks into media content and platforms, we aim to amplify diverse voices, promote transparency, and address pressing societal issues.
              </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Key Objectives</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Explore evolving media practices driven by technological innovation and their impact on societal concerns.</li>
                <li>Foster collaboration between media scholars, professionals, academicians, and students to bridge academic and real-world practices.</li>
                <li>Provide a platform for exchanging ideas, case studies, and best practices in journalism, advertising, entertainment, PR, and digital media.</li>
                <li>Encourage research to contribute to ethical, inclusive, and impactful media growth.</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Conference Highlights</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Publication:</strong> Selected full papers will be published in a Peer-Reviewed Research Journal, subject to author approval and meeting publication guidelines.</li>
                <li><strong>Paper Presentation:</strong> Hybrid Mode (Offline + Online).</li>
                <li><strong>Awards and Recognitions:</strong> Best Paper Award for each track.</li>
                <li><strong>Learning Opportunity:</strong> Keynote talks, workshops, panel discussions, and research paper presentations.</li>
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
              Abstracts up to 300 words based on qualitative and quantitative research papers, case studies, or working papers are invited from industry practitioners, academicians, research scholars, consultants, and students on the following themes (sub-themes are indicative but not exhaustive):
            </p>
            <div className="space-y-2">
              <Accordion title="Digital Persuasion: Marketing in the Era of AI & Data-Driven World">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Navigating Misinformation and Disinformation in the Digital Era</li>
                  <li>Ethics of AI in Newsrooms and Marketing Content Creation</li>
                  <li>Hyper-Personalization in Digital Marketing</li>
                  <li>Impact of Algorithm-Driven Content on Public Opinion</li>
                  <li>Digital Marketing and Influencer Economy in the Age of AI</li>
                  <li>AI-Driven Personalization & Customer Experience in Modern Marketing</li>
                  <li>Omnichannel and Multichannel Marketing</li>
                  <li>Conscious Consumerism and Ethics in Marketing</li>
                  <li>Role of AI in Designing and Delivering Choice Architecture to Consumers</li>
                  <li>Cross-Cultural Consumer Behavior and Global Branding Using Technology</li>
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
                <li>Abstract Submission Deadline: 2nd August 2025</li>
                <li>Acceptance Notification: 16th August 2025</li>
                <li>Full Paper Submission Deadline: 8th September 2025</li>
                <li>Last Date for Registration: 15th September 2025</li>
                <li>Conference Day: 20th September 2025</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Submission Guidelines</h2>
              <p className="text-justify leading-relaxed text-gray-700">
                <strong>Eligibility and Scope:</strong> All submissions should be original, not previously published, or under consideration elsewhere, and must align with the conference’s themes and topics.
                <br />
                <strong>Submission Platform:</strong> Abstracts up to 300 words must be submitted by email in Font Size and Style: 12 Times New Roman with Single Line spacing. Extended abstracts must include the context of the study, research objective, methodology, key findings, and practical implications, with a maximum of five keywords. Abstracts should be in past tense. Authors may submit work-in-progress, case studies, or industry papers for presentation, to be included in the conference compendium.
              </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Registration / Participation Fees</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Academicians and Research Scholars (Offline Presentation):</strong> Rs. 2000.00 per author (includes publication charges in a peer-reviewed journal); Rs. 2000.00 per additional author.</li>
                <li><strong>Academicians and Research Scholars (Online Presentation):</strong> Rs. 1500.00 per author (includes publication charges); Rs. 1500.00 per additional author.</li>
                <li><strong>Academicians and Research Scholars (Participation Only):</strong> Rs. 1000.00 per participant.</li>
                <li><strong>Industry Professional (Paper Presentation):</strong> Rs. 2500.00 per presenter (offline and online).</li>
                <li><strong>Industry Professional (Participation Only):</strong> Rs. 1000.00 per participant.</li>
                <li><strong>International Participant:</strong> USD 50 per participant.</li>
                <li><strong>Student Participant (up to three authors per paper):</strong> Rs. 800.00 per student.</li>
              </ul>
              <p className="mt-4 text-gray-700"><strong>Mode of Payment:</strong> QR Code for fee payment is required.</p>
              <a
                href="https://forms.gle/XqaGoi292Bcqihi67"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition"
              >
                Register Now
              </a>
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
        </div>
      </main>

      <footer className="bg-gray-100 py-6 px-4 text-center text-sm mt-10">
        © 2025 MET Institute of Mass Media. All rights reserved.
      </footer>
    </div>
  );
};

export default ConferenceLandingPage;