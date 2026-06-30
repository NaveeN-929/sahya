SAHAY — Master PRD 

Draft v1.0 

## **SAHAY** 

_(working name)_ 

## **Product Requirements Document** 

An AI-Powered Support Platform for Men Facing Abuse, Legal Distress, and Mental Health Challenges in India 

Version 1.0  |  Draft for Internal Review Prepared for: Naveen Cenrayan June 2026 

Page 1 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **Document Control** 

|**Field**|**Detail**|
|---|---|
|Document Status|Draft v1.0 — Foundational PRD, pending legal & clinical review|
|Owner|Naveen Cenrayan (Founder)|
|Classification|Confidential — contains sensitive program design for a vulnerable user<br>base|
|Intended Audience|Founding team, prospective technical co-founders/engineers, NGO & CSR<br>partners, advisors, early investors|
|Review Required<br>Before Build|Mental health clinician/counsellor; family law practitioner; data protection<br>counsel|



## **How to Read This Document** 

This PRD serves two audiences simultaneously, and it is written so each can navigate to what matters to them without wading through the other's material. 

- **If you are building this:** Sections 8 (System Architecture), 9 (AI Architecture), 10 (Data Model), 11 (API Specifications), and 16 (Engineering Roadmap) are your primary reference. Section 14 (Risk Assessment) and Section 15 (Legal & Ethical Considerations) contain constraints that should shape implementation decisions, not just compliance checkboxes added later. 

- **If you are evaluating this as a funder, NGO partner, or advisor:** Sections 1–7 (Executive Summary through Competitive Analysis), 13 (Go-to-Market), and 17 (Business Model & Financials) give you the strategic picture. Section 15 (Legal & Ethical Considerations) is worth your attention regardless — this is the section that determines whether this platform is trustworthy or reckless. 

A note on tone: this document treats the subject matter — abuse, suicide risk, contested legal allegations, family breakdown — with the seriousness it requires. Where the source brainstorm document used confident, settled language (e.g., labeling certain agents as ready to "detect" crises or give "legal" guidance), this PRD is deliberately more cautious. That caution is not bureaucratic hedging; building AI products that touch suicide risk and legal disputes without that caution is how people get hurt and platforms get shut down or sued. Where this document narrows scope or adds friction relative to the original vision, it explains why. 

Page 2 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **Table of Contents** 

Page 3 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **1. Executive Summary** 

## **1.1 The Problem in One Paragraph** 

India has built — appropriately — a substantial legal and institutional apparatus to protect women from domestic violence and abuse, anchored by the Protection of Women from Domestic Violence Act, 2005 and supported by a network of helplines, shelters, and NGOs. No equivalent gender-specific civil protection framework exists for men, and the institutional support ecosystem that does exist for men is small, fragmented, and largely invisible to the people who need it. Men experiencing domestic abuse, false or contested legal allegations, custody disputes, financial coercion, workplace harassment, or suicidal ideation linked to these pressures currently have nowhere coherent to turn — not because the issues aren't real, but because no one has built the infrastructure. 

## **1.2 The Product** 

This document specifies an AI-native support platform — referred to throughout by the working name Sahay (Hindi/Sanskrit-derived, meaning "support" or "help") — that combines anonymous AI emotional support, structured legal and mental-health education, private journaling and evidence organization, and a curated directory of vetted human professionals, with a long-term path toward a registered support organization offering a helpline and advocacy function. 

The product is deliberately sequenced so that the riskiest capabilities — AI-driven crisis detection and AI-generated legal guidance — are the most conservatively scoped in early phases, expanding only as real safety infrastructure (clinical partnerships, legal review, escalation pathways) is in place to support them. This is the single most important design decision in this document, and it is discussed at length in Sections 9 and 15. 

## **1.3 Why Now** 

- Smartphone and UPI penetration in India mean a digital-first, anonymous support channel is now genuinely reachable by the target demographic, including in tier-2/3 cities where stigma against seeking help in person is highest. 

- LLM-based conversational AI has reached a quality and cost point where empathetic, contextually aware first-line support is viable at near-zero marginal cost per user — something that was not true even three to four years ago. 

- Public conversation around men's mental health, "toxic masculinity" discourse, and falseallegation cases has grown substantially in Indian media and on social platforms over the past several years, increasing both awareness of the problem and willingness to engage with a platform addressing it — while also making this a sensitive, sometimes politicized space that the platform must navigate carefully (see Section 15.4). 

- No incumbent — Indian or global — occupies this specific intersection of anonymous AI support, legal literacy, and men-specific framing (see Section 6, Competitive Analysis). 

Page 4 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **1.4 What This Is Not** 

## **Explicit Non-Goals** 

This platform is not, and must never become, a tool for coaching men on how to discredit genuine abuse complainants, evade legitimate legal accountability, or organize hostility toward women or women's rights organizations. 

This platform does not provide legal advice, medical diagnosis, or therapy. It provides education, organization, triage, and routing to licensed humans who do those things. 

This platform is not a replacement for India's existing women's safety infrastructure, and nothing in its positioning, marketing, or content should frame it in opposition to that infrastructure. The honest framing is additive: a gap exists for men; filling it does not require tearing anything down. 

## **1.5 Recommended Path** 

Build and validate a narrow MVP (Section 12) centered on AI emotional support, structured legal/mental-health education content, and private journaling, with crisis support implemented as resource-surfacing rather than autonomous escalation (Section 9.4) until a clinical partner is secured. Validate demand and safety performance with a small cohort before expanding into the professional directory, community features, or any legal-guidance functionality that could carry liability. Pursue NGO/CSR partnership and not-for-profit registration in parallel, since the longterm credibility of this platform — especially anything resembling a helpline — depends heavily on institutional backing rather than a purely commercial app being trusted with disclosures of abuse and suicidal ideation. 

Page 5 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **2. Problem Statement & Market Context** 

## **2.1 The Legal Asymmetry** 

India's primary civil law instrument against domestic violence, the Protection of Women from Domestic Violence Act, 2005 (PWDVA), is explicitly gender-specific: it defines an "aggrieved person" as a woman, and provides for protection orders, residence orders, and monetary relief accordingly. This is a deliberate and, in the historical context of when it was enacted, defensible policy choice — domestic violence against women in India is well-documented at scale and the law responds to that reality. 

The consequence relevant to this PRD is structural, not a value judgment about the PWDVA itself: a man experiencing domestic abuse has no equivalent civil protection statute to invoke. His available remedies are general criminal law provisions — assault, criminal intimidation, extortion, cruelty provisions under matrimonial law where applicable, and IT Act provisions for cyber abuse — which were not designed with domestic-abuse dynamics in mind and which typically require a higher evidentiary bar and a willingness to engage the criminal justice system directly, with no equivalent of a fast civil protection order. 

Separately, and importantly distinct from the abuse question, India has also seen sustained public and judicial discussion of misuse of certain provisions — particularly Section 498A of the IPC (now reformulated under the Bharatiya Nyaya Sanhita) concerning cruelty by husband or relatives, and dowry-related provisions — including Supreme Court commentary urging safeguards against arrest on unverified complaints. This PRD treats this as exactly what it is: a real, documented procedural concern about misuse in some cases, existing alongside the equally real fact that dowry harassment and matrimonial cruelty are genuine and underreported. The platform's legal education content (Section 4.2, Section 9.2) must hold both truths simultaneously and must never collapse into a one-sided narrative in either direction. 

## **2.2 The Support Infrastructure Gap** 

Women experiencing abuse in India can access — however imperfectly in practice — a recognized ecosystem: the National Commission for Women, One-Stop Centres, Mahila helplines, protection officers mandated under the PWDVA, and a substantial network of NGOs with decades of institutional experience, funding relationships, and legal standing. 

The equivalent ecosystem for men is thin. A small number of organizations exist (research into specific current organizations, helplines, and their actual operating status is required before this document can name them with confidence — see Section 7.1 Research Brief), but they are not embedded in public consciousness the way women's helplines are, are not uniformly staffed by mental-health professionals, and in some cases are explicitly activist organizations focused on legal-reform advocacy rather than direct psychological support. There is no equivalent of a OneStop Centre. There is no protection-officer-equivalent role. Mental health support specifically competent in male-victim dynamics — which differ from female-victim dynamics in disclosure 

Page 6 of 57 

SAHAY — Master PRD 

Draft v1.0 

patterns, shame structure, and social response — is close to absent in mainstream therapy practice. 

## **2.3 The Stigma Compounding Effect** 

Three separate stigma layers compound for this user base in ways that don't apply identically to other underserved groups: 

- **Gendered disbelief:** "A man being abused by his wife/partner" is frequently met with social disbelief or ridicule rather than concern, discouraging disclosure even to friends or family. 

- **Mental health stigma:** Generalized Indian stigma around seeking mental health support applies on top of the above, and is well-documented as more acute for men socialized toward stoicism. 

- **Fear of legal exposure:** A man in an active dispute may reasonably fear that any disclosure — even to a therapist — could be subpoenaed, leaked, or used against him in family court, making him warier of conventional documentation than a typical mentalhealth patient. 

This third layer is specific to this product and has direct design consequences: anonymity, data minimization, and user control over evidence/journal data are not nice-to-have privacy features here — they are the precondition for the target user disclosing anything truthful at all. This is treated as a first-class design constraint throughout Sections 8–10, not a feature bullet. 

## **2.4 What the Data Actually Shows** 

The popular narrative around men's distress in India — amplified heavily on social media after high-profile cases — often asserts that marriage-related cruelty-law misuse is the dominant driver of male suicide. The actual NCRB (National Crime Records Bureau) “Accidental Deaths & Suicides in India” data does not support that specific claim, and this PRD treats getting that distinction right as a credibility test for the entire platform. 

- **The real numbers:** NCRB data for 2024 shows the male:female suicide ratio nationally at roughly 73.5:26.5. The leading recorded causes of suicide for men are “family problems” (the single largest category, around a third of all suicides when isolated from marriagespecific issues) and “illness,” not marriage-related issues specifically. Marriage-related issues (which NCRB further splits into non-settlement of marriage, dowry disputes, extramarital affairs, divorce, and other) account for a single-digit percentage of male suicides nationally — smaller than “family problems” and “illness,” and in recent years lower as a share than the equivalent figure for women, since dowry-related suicide is a documented driver of female suicide specifically. 

- **What is still true and still serious:** Men die by suicide at roughly three times the rate of women in India, use more lethal methods (resulting in lower intervention/rescue rates), and “family problems” — a broad NCRB category that plausibly includes domestic conflict, caregiving strain, and relationship breakdown not narrowly coded as “marriage-related” — is the single biggest recorded cause for both sexes. None of that requires inflating the 

Page 7 of 57 

SAHAY — Master PRD 

Draft v1.0 

marriage-specific figure to justify this platform; the underlying case for better support infrastructure for men is strong on the real numbers alone. 

- **Implication for the platform:** Content, marketing copy, and any future fundraising material must cite the actual NCRB breakdown rather than the popularized “one lakh men a year die because of false cases” framing that circulated after specific high-profile incidents. That framing is not supported by NCRB's own category breakdown and using it would tie this platform's credibility to a number that fact-checkers and journalists have already publicly debunked. Section 15.4 discusses this further as a reputational-risk item, not just an accuracy item. 

## **2.5 Existing Government Infrastructure This Platform Should Connect To, Not Duplicate** 

One material correction to the original brainstorm: India is not starting from zero on mentalhealth crisis infrastructure, and the platform's design should treat this as a resource to integrate with rather than a gap to fill independently. 

- **Tele-MANAS (14416 / 1-800-891-4416):** a free, 24/7, government-run (Ministry of Health and Family Welfare, with NIMHANS Bengaluru as the apex clinical body) tele-mentalhealth helpline available in 20 languages, with a two-tier model — trained counsellors at Tier 1, psychiatrist escalation at Tier 2 — and an established follow-up/callback protocol for high-risk callers. It is gender-neutral by design and already has the clinical and legal standing this platform cannot build itself in year one. 

- **Design consequence:** the platform's Crisis Detection Agent (Section 9.4) should be designed primarily as a high-quality router into Tele-MANAS and other existing crisis lines, not as a parallel crisis-response system competing with infrastructure that already has clinical backing the platform lacks. This materially de-risks the “full AI crisis detection with auto-escalation” goal stated for this product: the safest and fastest path to that goal is auto-surfacing Tele-MANAS (and other relevant lines) the moment risk signals appear, with one-tap connect, rather than building independent escalation infrastructure from scratch. 

## **2.6 Market Sizing — Honest Framing** 

## **What can be said with confidence vs. what requires primary research** 

Defensible from existing public data: India has roughly 280 million ever-married men in the relevant adult age range. Suicide among men aged 15–39 is a major, well-documented public health issue, and NCRB data consistently shows male suicide rates around three times female rates nationally, with family problems and illness — not marriage disputes specifically — as the leading recorded causes. Separately, national surveys on intimate partner violence that ask both-direction questions (where they exist) find non-trivial rates of women-perpetrated violence against male partners, though Indian-specific large-sample data using validated instruments is thin. 

NOT yet defensible, and must not appear in pitch materials as a hard number: any specific 

Page 8 of 57 

SAHAY — Master PRD 

Draft v1.0 

addressable-market figure (e.g., “40 million men need this”) presented without a citation chain back to a specific, named, methodologically sound study. The original brainstorm document did not include such a study, and this PRD declines to manufacture a precisesounding number to fill that gap. Section 7.1 specifies the primary research needed to responsibly produce one. 

Page 9 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **3. Issue Taxonomy: What the Platform Must Address** 

This section restructures the original brainstorm's issue list into a taxonomy with two added dimensions per category: (a) the evidence basis for treating it as a real, addressable problem in the Indian context, and (b) the platform's actual capability boundary — what the product can responsibly do about it versus what requires referral to a human professional or institution. Every category in the original document is preserved; none are removed. The framing is tightened so the document doesn't read as advocacy copy. 

## **3.1 Domestic and Intimate Partner Abuse** 

Covers physical violence, emotional abuse, psychological manipulation, verbal abuse, coercive control, and economic abuse experienced by men from a spouse, partner, or partner's family. 

- **Evidence basis:** Indian and international research increasingly documents bidirectional intimate partner violence, though large-sample, validated-instrument data specific to male victimization in India remains limited compared to the female-victim literature. This is a real and under-researched phenomenon, not a fabricated grievance — but the platform should not claim a precision of scale it cannot support (see Section 2.6). 

- **Platform capability:** AI Companion can provide structured space to articulate and recognize patterns (abuse identification, Section 9.3); Journal can document incidents contemporaneously, which has real evidentiary value if the relationship later involves legal proceedings; Resource Directory can route to therapists and, where they exist, men's support groups. The platform cannot and must not attempt to mediate, verify, or adjudicate the relationship itself. 

## **3.2 Mental and Emotional Abuse** 

Constant humiliation, gaslighting, isolation from friends/family, threats, and emotional blackmail. This category overlaps heavily with 3.1 but is called out separately because it is often present without physical violence and is therefore the hardest for victims to name or for others to recognize as “real” abuse — particularly for men, who report this dynamic being dismissed even when disclosed. 

- **Platform capability:** This is where the AI Companion's structured, psychoeducational framing (e.g., explaining what gaslighting and coercive control are, with concrete behavioral examples, not just labels) has the highest standalone value, since it can give users vocabulary for an experience they may not have had named to them before. 

## **3.3 Disputed or Contested Legal Allegations** 

Dowry-related allegations, domestic violence allegations, and sexual-offence allegations where the man disputes the claim, in whole or in part. 

## **This is the category requiring the most editorial discipline** 

Page 10 of 57 

SAHAY — Master PRD 

Draft v1.0 

The existing Indian “men's rights” organizational ecosystem (Save Indian Family Foundation/SIF and its affiliated groups, Men Welfare Trust, Men Helpline, and similar) is built almost entirely around this category, and their public materials consistently use combative language (“legal terrorism,” “misandry,” “fight false 498A case”) and explicitly advocacy-oriented goals (repealing or weakening specific protections, not just supporting individuals). Section 6 (Competitive Analysis) examines this ecosystem directly. 

This platform's differentiation depends on NOT adopting that posture. The product's job is to help a specific individual understand the legal process he is actually in, organize his documentation, and connect him to a lawyer — not to tell him his accuser is lying, not to aggregate “misuse” statistics as a campaign tool, and not to frame the existence of protective laws for women as the problem. Section 9.2 (Legal Information Agent) and Section 15.2 specify hard content boundaries for this category. Every man in a contested legal proceeding deserves competent process information and a referral to counsel — regardless of whether the underlying allegation is true, false, or somewhere in the genuinely contested middle the law exists to sort out. 

- **Platform capability:** Legal Information Agent explains process (what an FIR is, what anticipatory bail means, typical timelines, what to expect at each stage) without commenting on the merits of any specific case; Journal/Evidence module helps organize chronology and documentation for the user's own lawyer; Resource Directory routes to vetted family-law practitioners. The platform must repeatedly and explicitly tell users it cannot evaluate whether an allegation is true or false and is not legal advice. 

## **3.4 Child Custody and Parental Access** 

- Difficulty obtaining custody or even routine visitation, and parental alienation dynamics during or after separation. 

- **Legal context note:** Indian custody law (primarily the Guardians and Wards Act, 1890 and, for Hindus, the Hindu Minority and Guardianship Act, 1956) does not provide a statutory presumption of joint or shared parenting the way some other jurisdictions do; outcomes are determined case-by-case on a “best interest of the child” standard, and very young children are often placed with the mother as a starting presumption in practice, though this varies by court and circumstance. This is genuinely difficult terrain and the platform's content here must be reviewed by a family law practitioner before publication (Section 7.3). 

- **Platform capability:** Education on custody process and terminology; emotional support specific to parental-alienation distress (a recognized, painful experience regardless of legal framing); referral to family lawyers and, ideally, child psychologists where the dispute involves the child's wellbeing. 

Page 11 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **3.5 Financial and Economic Abuse** 

- Forced financial dependency, coercive maintenance demands used as leverage rather than genuine need, and debt incurred through family disputes (litigation costs, forced asset transfers, etc.). 

- **Platform capability:** Education on maintenance/alimony law basics and what documentation matters in a maintenance dispute; this is squarely an area for lawyer/financial-advisor referral rather than AI-generated guidance, given how fact-specific maintenance calculations are. 

## **3.6 Workplace Harassment** 

- Bullying, emotional harassment, and discrimination experienced by men in professional settings. 

- **Platform capability:** Emotional support and documentation tools transfer directly from the domestic-abuse use case; legal content can cover what protections exist (general labour law, IT Act for any digital harassment component) without overstating the relatively thin specific protections available compared to, e.g., the POSH Act's framework for workplace sexual harassment of women. 

## **3.7 Sexual Abuse and Coercion** 

- Sexual assault, sexual coercion, and sexual blackmail experienced by men, including by female and male perpetrators. 

This is a category with even less institutional recognition than domestic abuse. Indian rape law (Section 63 BNS, formerly 375 IPC) defines rape in terms that do not recognize a male victim of female-perpetrated rape under that specific provision, though other provisions (sexual assault, outraging modesty equivalents are gendered toward female victims too, while general assault/criminal force provisions are available regardless of victim gender). This is one of the most legally underdeveloped areas this platform will touch, and content here carries the highest risk of being simply wrong if not reviewed by counsel. Treat with extreme care and flag prominently as requiring case-specific legal advice. 

## **3.8 Cyber Abuse** 

- Online harassment, blackmail, doxxing, cyberstalking, and non-consensual intimate imagery (“revenge porn”) targeting men. 

- **Platform capability:** This is comparatively strong legal-information territory: the IT Act, 2000 (Sections 66E, 67, 67A) and BNS provisions on stalking, criminal intimidation, and defamation apply regardless of victim gender, and law enforcement cybercrime cells (including the national cybercrime reporting portal) are a concrete, actionable referral. This category is a good candidate for some of the clearest, most confidently actionable content in the Knowledge Platform (Section 9.2). 

Page 12 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **3.9 Elder Abuse** 

- Neglect, financial exploitation, and emotional abuse experienced by older men, frequently at the hands of adult children or other family members. 

- **Legal context:** The Maintenance and Welfare of Parents and Senior Citizens Act, 2007 is gender-neutral and provides a real, usable legal remedy — one of the few areas in this taxonomy where existing law is already adequate and the platform's job is purely awareness and access, not advocacy for new protection. 

## **3.10 Family and Social Pressure** 

- Forced marriage pressure, honour-based family conflict, manipulation, and property disputes within extended family structures. 

- **Platform capability:** Primarily an emotional-support and psychoeducation category; property disputes specifically should route to lawyers immediately given how fact- and document-dependent Indian property law is. 

## **3.11 Mental Health Consequences** 

- Depression, anxiety, PTSD, isolation, substance use, and suicidal ideation arising from any of the above. 

This is the category where the platform's crisis-safety architecture matters most, and where the product must defer most completely to clinical infrastructure rather than attempting novel AI capability. See Section 9.4 (Crisis Detection Agent) and Section 2.5 (Tele-MANAS integration) in full. 

## **3.12 Summary Table — Capability Mapping** 

|**Issue Category**|**AI Companion**|**Legal Education**|**Journal/**<br>**Evidence**|**Human Referral**<br>**Needed**|
|---|---|---|---|---|
|Domestic/IPV<br>abuse|Yes — primary|General process<br>only|Yes — high<br>value|Therapist; lawyer if<br>escalating|
|Emotional/<br>psychological<br>abuse|Yes — primary|Limited relevance|Yes|Therapist|
|Disputed legal<br>allegations|Support only,<br>not case<br>analysis|Yes — process &<br>rights|Yes — high<br>value|Lawyer — mandatory|
|Custody/parental<br>access|Support only|Yes — reviewed<br>content|Yes|Family lawyer; child<br>psychologist|
|Financial/<br>economic abuse|Support only|Basic concepts<br>only|Yes|Lawyer; financial advisor|
|Workplace<br>harassment|Yes|Limited — thin law|Yes|Lawyer; HR/labour body|



Page 13 of 57 

SAHAY — Master PRD 

Draft v1.0 

|**Issue Category**|**AI Companion**|**Legal Education**|**Journal/**<br>**Evidence**|**Human Referral**<br>**Needed**|
|---|---|---|---|---|
|Sexual<br>abuse/coercion|Yes — careful,<br>trauma-<br>informed|Minimal — high<br>legal risk|Yes|Lawyer — mandatory;<br>therapist|
|Cyber abuse|Yes|Yes — strong,<br>clear law|Yes —<br>screenshots<br>etc.|Cybercrime cell; lawyer<br>optional|
|Elder abuse|Yes|Yes — clear law<br>(2007 Act)|Yes|Lawyer; local tribunal|
|Family/social<br>pressure|Yes — primary|Property: refer<br>immediately|Yes|Lawyer for property only|
|Mental<br>health/suicide risk|Triage +<br>support, not<br>therapy|N/A|Mood/journal<br>tracking|Tele-MANAS / clinician<br>— mandatory pathway|



Page 14 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **4. Opportunity Analysis** 

## **4.1 The Specific Gap** 

No platform currently combines, under one product and one trust relationship, all of: anonymous AI emotional support calibrated to male disclosure patterns, accurate (not advocacy-slanted) legal process education for the specific disputes men in India actually face, private incident/evidence documentation, and routing to vetted human professionals. Section 6 examines each adjacent category — global mental health apps, Indian legal-tech platforms, and the existing men's-rights NGO ecosystem — in detail; the short version is that each covers one slice of this and none cover the combination, and the one ecosystem that does combine emotional support with legal information (the SIF-affiliated NGO network) does so with an advocacy posture that limits its trustworthiness to a broader population and to institutional partners. 

## **4.2 Why an AI-Native Approach Specifically Helps Here** 

- **Zero-judgment first contact:** the single largest reported barrier to men seeking help is fear of being disbelieved or mocked. An AI's first response is consistent and nonjudgmental by construction, which lowers the activation energy for a first disclosure in a way a hotline staffed by humans — however well-trained — cannot fully replicate, precisely because users know a human is judging in real time even when reassured otherwise. 

- **Always-available, language-flexible:** distress doesn't keep office hours, and India's linguistic diversity means text-based AI support can plausibly operate in many more languages at much lower marginal cost than a staffed multilingual helpline — though this is a roadmap item (Section 13), not an MVP claim, since quality multilingual mental-health support requires real validation, not just translation. 

- **Structured documentation at scale:** AI-assisted journaling and timeline construction is a capability that genuinely didn't exist cheaply before LLMs, and it directly serves a need (organizing a chronology for a lawyer, or for one's own clarity) that is currently served only by ad hoc note-taking or not at all. 

- **Honest caveat:** AI-native does not mean AI-only. The opportunity is in AI making the funnel into human help wider and less intimidating, not in AI replacing therapists, lawyers, or crisis counsellors. Any version of this product that drifts toward “AI instead of a lawyer/therapist” rather than “AI toward a lawyer/therapist” has moved from opportunity to liability. This distinction is treated as load-bearing throughout Sections 9 and 15. 

## **4.3 Why This Is Defensible as a Business, Not Just a Cause** 

Three real demand signals exist independent of the social-impact framing: the existing men'srights NGO ecosystem (Section 6.3) demonstrates people will call a helpline number for this category of problem at meaningful volume (one organization in this space reports thousands of monthly calls); the broader Indian mental-health app market (Wysa, and international entrants) 

Page 15 of 57 

SAHAY — Master PRD 

Draft v1.0 

demonstrates willingness to pay for AI-mediated mental health support; and legal-tech/document-assistance platforms demonstrate willingness to pay for structured help navigating Indian legal processes. This product sits at the intersection of three validated willingness-to-pay categories rather than inventing a fourth from nothing — though Section 17 (Business Model) is candid that the highest-trust version of this product likely monetizes more like a freemium-plus-donations NGO model than a pure subscription SaaS, given the sensitivity of the use case. 

Page 16 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **5. Product Vision & Mission** 

## **5.1 Mission Statement** 

_“No man should have to face abuse, legal distress, or emotional trauma without knowing where to turn.”_ 

This is a deliberate softening of the original draft's phrasing (“No man should suffer abuse, trauma, or emotional pain alone”) toward something the product can actually deliver: the platform cannot guarantee no one suffers alone in a felt, emotional sense — no product can — but it can credibly guarantee that not knowing where to turn is not the reason someone goes without help. Mission statements that promise emotional outcomes the product architecture cannot control set up the platform for a credibility gap the moment a user has a bad experience; this version is both more honest and, frankly, more achievable as a measurable goal. 

## **5.2 Long-Term Vision (5–10 Years)** 

Sahay grows from a digital product into a recognized support institution for men in India, encompassing: 

- A trusted AI-first digital support layer used as the default first point of contact for men in distress, in the way Tele-MANAS has become a default first point of contact for general mental health concerns. 

- A vetted referral network of family lawyers, therapists, and financial advisors with demonstrated competence in male-specific dynamics, large enough to serve meaningful volume across major Indian cities and, eventually, tier-2 towns. 

- A registered not-for-profit or Section 8 company arm capable of advocacy, research publication, and potentially an eventual helpline — pursued deliberately slowly and only once the digital product has demonstrated safety and trust at scale (see Section 13.4, sequencing rationale). 

- A credible, citation-grounded annual research publication on men's mental health and legal-system experience in India — positioned explicitly as evidence-based research, not advocacy literature, to avoid the credibility trap the existing NGO ecosystem has fallen into. 

## **5.3 Design Principles** 

Carried over from the original brainstorm, with one addition (the final principle) that the original document's own “guiding principles” section implied but didn't state as a hard design rule: 

- **Anonymous by default:** no user should need to surrender identity to receive support; identity is opt-in, only where functionally required (e.g., booking a paid session with a named lawyer). 

- **Privacy first:** data minimization as an architectural default, not a settings toggle (Section 8.5, Section 10). 

Page 17 of 57 

SAHAY — Master PRD 

Draft v1.0 

- **Non-judgmental:** the AI never implies a user is overreacting, exaggerating, or at fault, regardless of how a disclosed situation reads. 

- **Compassionate but not sycophantic:** support does not mean uncritical validation of every framing or action a user describes — see Section 9.1 on emotional-support agent boundaries. 

- **Secure:** encryption and access control treated as core infrastructure, not a feature (Section 8.5). 

- **Evidence-based guidance:** content and AI outputs are traceable to a citable source — a named statute, a named study, a licensed professional's review — not generated confidently from the model's general training. 

- **Human escalation when required:** the AI knows, and is designed to act on, the limits of what it should handle alone. 

- **Politically neutral on the underlying gender debate:** the platform serves men who need support without taking an institutional position on contested questions like whether the PWDVA should be made gender-neutral, whether Section 498A/BNS 85-86 is “overused,” or broader culture-war framing. It can and should state facts (what the law says, what the data shows) without adopting advocacy positions on what the law should become. This is the principle most at odds with the existing competitive ecosystem (Section 6.3) and the one most likely to be tested by users, content contributors, and future investors who expect or want the platform to take a side. 

Page 18 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **6. Competitive Analysis** 

The original brainstorm named BetterHelp, Wysa, Calm, Headspace, and unspecified “men's support organizations” and “legal platforms” as comparators. This section treats each category with the depth needed to actually differentiate against it, and adds the one category the original list under-specified: the existing Indian men's-issues NGO ecosystem, which is this product's closest real analog and most important point of differentiation. 

## **6.1 Global AI Mental Health Apps (Wysa, Calm, Headspace, BetterHelp)** 

Wysa is the most relevant of these and deserves attention as the most direct structural comparator, not just a category example: it is India-founded (Bengaluru), uses an AI conversational agent grounded in CBT and related evidence-based modalities, has pursued real clinical validation (FDA Breakthrough Device Designation for a chronic-pain-and-depression indication, published peer-reviewed efficacy data), and has built its triage flow to route users toward crisis support and, in paid tiers, human clinicians. Its revenue is heavily B2B/B2B2C (employers, insurers, health systems) rather than direct consumer subscription, and it has expanded into low-connectivity, non-English contexts in India via a “phygital” workbook-plusQR-code model for reach where smartphone/data access is limited. 

- **What Wysa validates for this PRD:** an AI conversational agent can form a therapeuticfeeling bond at scale, India-built AI mental health products can achieve real clinical credibility and meaningful funding, and B2B/institutional revenue can subsidize free consumer access — a viable financial model option explored further in Section 17. 

- **What Wysa does not do:** Wysa is gender-neutral and has no legal-education, evidencedocumentation, or men's-specific framing. It does not address the disputed-allegation, custody, or financial-abuse categories central to this platform at all. A man using Wysa for distress connected to a custody battle gets generic CBT support, not anything connected to his actual situation. 

- **Calm and Headspace:** primarily meditation/mindfulness consumer apps with limited conversational AI and no clinical-crisis or legal dimension; useful only as a reminder that slick consumer UX and a strong content library (Section 9.2) matter for retention, not as functional competitors. 

- **BetterHelp:** a therapist-marketplace model (matching, scheduling, video sessions) rather than an AI-first model; relevant to Section 9.5 (Resource/Professional Directory) as a UX reference for matching and booking flows, and as a cautionary note — BetterHelp has faced public scrutiny and a US FTC enforcement action over data-sharing practices with advertisers, which is directly relevant to this platform's privacy architecture (Section 8.5, Section 15.3): a support platform handling disclosures of abuse cannot afford even the appearance of data practices like that. 

Page 19 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **6.2 Indian Legal-Tech and Document Platforms** 

Platforms offering legal document drafting, lawyer marketplaces, or legal-process explainer content (general legal-tech category) exist in India but are typically generalist (covering everything from property to corporate law) rather than specialized in family/criminal law from a male-litigant perspective, and none combine legal content with emotional support or evidence organization the way this product intends to. This is a genuine white space, but it is also the area where this PRD recommends the most caution: legal-tech generalist platforms typically position themselves explicitly as “not legal advice” and route to lawyers for anything substantive, and this product should hold that same line at least as strictly given the emotional vulnerability of its users (Section 15.2). 

## **6.3 The Existing Indian Men's-Issues NGO Ecosystem — Read Carefully** 

## **This is the most important competitive finding in this PRD** 

Organizations already exist in this exact space — Save Indian Family Foundation (SIF) and its affiliated network (Men Welfare Trust, Daaman, and others), Men Helpline Org, and related groups — some operating since the mid-2000s, with real call volume (one network reports thousands of monthly calls to a helpline) and real reach (SIF describes itself as a conglomerate of 50+ affiliated NGOs with India and international chapters). 

Their public-facing material consistently frames the mission in advocacy and adversarial terms: phrases observed in current public sources include describing Section 498A/its BNS successor as having been called “legal terrorism,” framing their work explicitly around helping men “falsely trapped in gender based laws,” publishing aggregated case-law roundups oriented toward husbands' legal wins, and using language like “widespread malehatred in society.” Some of this ecosystem's content blends legitimate legal-process information with one-sided narrative framing in the same breath — e.g., presenting any acquittal or maintenance reduction as evidence the underlying law is being weaponized, rather than as a normal outcome of a contested case working through the legal system as designed. 

This is not a dismissal of the real pain their callers and members report, which is genuine. It is a finding about positioning and trust: this ecosystem has, by its own public framing, organized itself as one side of a gender-law culture war rather than as a neutral support service. That makes it structurally unable to be the trusted, broadly credible institution this PRD's mission (Section 5.1) describes — it cannot easily partner with mainstream mentalhealth bodies, government programs like Tele-MANAS, or CSR-conscious corporate funders without inheriting that framing's baggage. 

- **The differentiation this PRD recommends:** Sahay should be positioned, in every piece of content and every partnership conversation, as a support and information service — not an advocacy or legal-reform movement. It can exist for men without existing against the legal protections women rely on. Practically, this means: no aggregated “misuse statistics” campaigns; no framing that implies disbelief of complainants as a category; citation discipline on every legal and statistical claim (Section 2.4 is the model); and explicit public materials, from day one, distinguishing the platform from the existing men's-rights NGO 

Page 20 of 57 

SAHAY — Master PRD 

Draft v1.0 

ecosystem so journalists, partners, and new users don't conflate the two. This is a real risk to actively manage, not a one-time decision — see Section 15.4. 

- **Where this ecosystem is a genuine resource, not just a cautionary tale:** individual SIF-affiliated organizations have real-world experience, in-person support group infrastructure across dozens of Indian cities, and case-pattern knowledge this platform's content team should consult during research (Section 7.1) — while applying independent editorial judgment rather than republishing their framing wholesale. 

## **6.4 Competitive Positioning Summary** 

|**Dimension**|**Wysa/Calm/**<br>**Headspace**|**SIF-affiliated**<br>**NGOs**|**Generalist legal-**<br>**tech**|**Sahay (this**<br>**product)**|
|---|---|---|---|---|
|Gender focus|Neutral|Men, advocacy-<br>framed|Neutral|Men, support-<br>framed|
|AI conversational<br>support|Strong|None|None/minimal|Core feature|
|Legal education|None|Yes, one-sided|Yes, generalist|Yes, neutral &<br>cited|
|Evidence/journal<br>tools|None|Minimal/manual|Document<br>drafting|Core feature|
|Clinical credibility|Strong (Wysa)|Low/unclear|N/A|Goal, via<br>partnership|
|Institutional trust|High|Low outside<br>niche|Moderate|Goal — must be<br>earned|



Page 21 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **7. Research Plan & User Personas** 

## **7.1 Research Required Before Build — Prioritized** 

The original brainstorm listed research areas without sequencing or owners. This PRD treats research as gating for specific build decisions, not a parallel-track nice-to-have, because several of the riskiest product decisions (crisis escalation design, legal content boundaries, custody content) cannot be responsibly finalized without it. 

## **Tier 1 — Gates MVP build, must happen first** 

- **Clinical safety review:** engage at least one licensed psychiatrist or clinical psychologist (ideally with suicide-prevention or crisis-line experience — a Tele-MANAS-affiliated clinician would be ideal given the integration described in Section 2.5) to review the Crisis Detection Agent's design, escalation triggers, and language before any user-facing crisis flow ships, even in MVP. 

- **Legal content review:** engage a practicing family law / criminal law advocate to review every piece of legal-education content before publication, with specific attention to the custody (3.4) and sexual-offence (3.7) categories flagged as highest legal-accuracy risk in Section 3. 

- **Data protection counsel review:** review of the data model (Section 10) and evidencestorage design (Section 8.5) against the Digital Personal Data Protection Act, 2023 (DPDPA) before any user data — especially journal/evidence content, which will often constitute sensitive personal data — is collected, even in a closed beta. 

## **Tier 2 — Should happen during MVP build, gates Phase 2+** 

- **User research with actual target users:** structured interviews (not just informal calls) across at least the five persona types in Section 7.3, run with a research partner or trained interviewer given the sensitivity of the topics, with informed consent and no incentive structure that pressures disclosure. 

- **Primary market sizing study:** either commission or partner with an academic/research institution to produce a citable estimate of addressable population, since Section 2.6 found no existing study precise enough to use in fundraising materials. 

- **Competitive deep-dive interviews:** structured conversations with at least 2-3 organizations in the existing NGO ecosystem (Section 6.3) to understand call patterns, common case types, and operational lessons, conducted with transparency about this product's differentiated positioning rather than presenting as a journalist or researcher under false pretenses. 

## **Tier 3 — Ongoing / informs Phase 3+** 

- AI safety research tracking: hallucination rates in legal-domain LLM outputs, crisisdetection false-negative/false-positive literature, and emerging Indian regulatory guidance on AI in health-adjacent products (Section 15.5). 

Page 22 of 57 

SAHAY — Master PRD 

Draft v1.0 

- Business model research: structured comparison of NGO, social-enterprise, freemium, and CSR-partnership models specific to mental-health-adjacent products in India (expanded in Section 17). 

## **7.2 Mental Health Research Topics — Scope Note** 

The original document listed depression, trauma, PTSD, anxiety, abuse recovery, and suicide prevention as research topics. These remain correct, with one addition: research specifically into male-pattern disclosure and help-seeking behavior (which differs from general population patterns — men are documented to disclose later, use more indirect language, and respond differently to direct “how are you feeling” framing than structured, action-oriented framing) should inform the AI Companion's conversational design (Section 9.1) directly, not just sit as background reading. 

## **7.3 User Personas** 

Five personas, derived from the target-user categories in the original document (married men, divorced men, fathers, young men, elderly men) and elaborated with enough specificity to drive actual design decisions. These are working hypotheses to be validated against Tier 2 research above, not finalized research findings. 

## **Persona 1 — “Arjun,” 34, Married, Mid-Career Professional, Tier-1 City** 

- Situation: in a marriage with escalating conflict involving financial control and threats of a false complaint; hasn't told anyone at work or most friends; worried disclosure to a therapist could somehow surface in a future legal proceeding. 

- Primary need: a safe place to think out loud and recognize the pattern of what's happening to him; secondary need is concrete information about what actually happens if a complaint is filed, so the fear becomes manageable rather than paralyzing. 

- Design implication: anonymity must be airtight and clearly explained; legal-process content here directly reduces anxiety, so it should be easy to find without requiring a crisis-level disclosure first. 

## **Persona 2 — “Vikram,” 41, Divorced, Father, Tier-1 or Tier-2 City** 

- Situation: divorce finalized 1-2 years ago, ongoing custody/visitation friction, possible parental alienation; financially strained from litigation costs and maintenance payments; isolated from his previous social circle. 

- Primary need: emotional support specific to parental-alienation grief (a recognized but rarely named experience) and practical help tracking visitation incidents for potential future court use. 

- Design implication: Journal/timeline tooling (Section 9.6) is highest-value here; needs clear distinction between venting/support and anything resembling legal strategizing, given the live custody dispute. 

Page 23 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **Persona 3 — “Sandeep,” 27, Unmarried, Early Career, Tier-2 City** 

- Situation: experiencing workplace harassment from a senior colleague and separately navigating family pressure around an arranged-marriage timeline; mental health stigma very high in his immediate social circle; limited disposable income. 

- Primary need: low-friction, free-tier emotional support and psychoeducation; price sensitivity is real, so any paywall on basic support functions risks losing this persona entirely. 

- Design implication: freemium tier (Section 17.2) must include genuinely useful AI Companion access, not a stripped demo, or this persona — plausibly the largest volume segment — churns immediately. 

## **Persona 4 — “Raghav,” 38, Facing a Disputed Legal Allegation** 

- Situation: an FIR or complaint has been filed against him; he disputes some or all of the allegation; high acute distress, possible suicidal ideation (this is the persona most likely to intersect with crisis-detection triggers); urgently needs a lawyer but doesn't know how to find one he can trust or afford. 

- Primary need: rapid, accurate process information to reduce panic, a credible path to a vetted lawyer, and crisis support that recognizes the acuteness of this specific situation type without assuming guilt or innocence. 

- Design implication: this persona is the platform's highest-stakes user from a safetyarchitecture perspective and should explicitly inform Crisis Detection Agent design (Section 9.4) and Legal Information Agent boundaries (Section 9.2) — the two riskiest components in the entire system. 

## **Persona 5 — “Mohan,” 64, Elder, Semi-Urban** 

- Situation: experiencing neglect and financial exploitation from an adult child; low smartphone/digital literacy; possible language preference outside English/Hindi; likely to need the platform via a family member's device or assisted access rather than independent use. 

- Primary need: extremely simple access path (possibly voice-first, a roadmap item per Section 13) and clear information about the Senior Citizens Act, 2007 remedy, which is comparatively strong and accessible existing law. 

- Design implication: this persona is explicitly out of scope for MVP (Section 12) given the digital-literacy and language barriers involved, but should not be permanently deprioritized — it's one of the categories where existing law already works well and the platform's job is mainly awareness, which is a comparatively low-risk, high-leverage thing to build toward in Phase 2-3. 

Page 24 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **8. System Architecture** 

## **8.1 Architecture Philosophy** 

Three constraints shape every architectural decision in this section, in priority order: (1) a user's disclosure must never be more exposed, more permanently stored, or more linkable to their identity than is strictly necessary for the feature they're using; (2) the system must degrade safely — if an AI component fails or behaves unexpectedly, the failure mode should be “surface a human resource”, never “silently say nothing” or “confidently say something wrong”; (3) the stack should be buildable and operable by a small team (Section 16), since over-engineering for hypothetical scale before product-market fit is validated is a real risk for a solo/small-team build. 

The original brainstorm's proposed stack (Next.js, Rust/Axum or Actix, MongoDB, Better Auth, OpenAI, Qdrant, S3-compatible storage, Docker/Kubernetes, Cloudflare) is sound and is retained with the modifications below, mostly informed by the privacy constraint above and by your existing Shimmer & Shine stack choices, which used a similar open-source-leaning Rust/Axum backend successfully. 

## **8.2 High-Level Architecture** 

Conceptually, four planes: 

- **Client plane:** Next.js web app (mobile-responsive first; native mobile apps are a Phase/Future item per Section 13.2, not MVP — a PWA-style web app reduces build surface area substantially for a small team and is sufficient to validate demand). 

- **Application plane:** Rust (Axum) backend services handling auth, journaling, evidence storage, resource directory, and orchestration of AI agent calls. Rust is retained from the original stack — it fits your existing expertise and the Shimmer & Shine precedent, and its strong typing and memory safety are a genuine asset for a system handling sensitive personal data, where a class of bugs (use-after-free, buffer issues) that could cause data leakage in less memory-safe languages is structurally prevented. 

- **AI plane:** a dedicated orchestration layer (Section 9.6) that mediates all calls to LLM providers, enforces safety checks before and after generation, and logs (in privacypreserving form) enough to audit crisis-detection performance without storing raw conversation content longer than necessary. 

- **Data plane:** PostgreSQL (recommended change from MongoDB — see 8.3 below) for structured/relational data, Qdrant for vector search (knowledge base retrieval and journal semantic search), and S3-compatible object storage (Cloudflare R2 recommended for zero egress fees, relevant given image/PDF evidence uploads) for files. 

## **8.3 Recommended Change: PostgreSQL Instead of MongoDB** 

**Why this PRD deviates from the original brainstorm here** 

Page 25 of 57 

SAHAY — Master PRD 

Draft v1.0 

The original stack specified MongoDB. This PRD recommends PostgreSQL instead, for reasons specific to this product's data shape and compliance needs, not as a generic relational-vs-document preference. 

First, the core entities here — users, journal entries, incidents, evidence files, professional referrals, consent records — are highly relational (a journal entry belongs to a user, references zero or more evidence files, may be linked to an incident timeline; consent records must be auditable and queryable in ways that benefit from real foreign keys and transactions). Second, DPDPA compliance (Section 15.3) will require precise, auditable consent and data-subject-request handling — “delete everything linked to this user” is a much safer, more verifiable operation with relational integrity constraints than with denormalized documents. Third, Postgres with the pgvector extension can actually absorb the Qdrant use case for an MVP-scale system, reducing infrastructure surface area for a small team; Qdrant remains the right choice once vector search volume or recall requirements grow beyond what pgvector comfortably handles, so this PRD treats Qdrant as a Phase 2+ addition rather than an MVP requirement. 

This is a recommendation, not a hard requirement — if Naveen's team has stronger existing MongoDB operational muscle and prefers to ship MVP faster on familiar ground, that's a legitimate trade-off. The compliance argument is the strongest reason to reconsider, not a claim that MongoDB is incapable of doing this. 

## **8.4 Component Diagram (Description)** 

Rendered as a system diagram in the accompanying technical appendix; described here in text for document portability: 

1. Client (Next.js PWA) communicates over HTTPS only with the Application API Gateway (Axum), never directly with the AI provider or database. 

2. Application plane exposes REST endpoints (Section 11) for auth, journal, evidence, directory, and a single /agent/converse endpoint that proxies to the AI Orchestration service — the client never holds an LLM provider API key or calls the provider directly. 

3. AI Orchestration service receives a request, attaches only the minimum context needed (recent conversation turns, relevant retrieved knowledge-base chunks via vector search, and a safety-classifier pass over the latest user message), calls the LLM provider, runs the response through a post-generation safety check (Section 9.4), and returns either the AI response or a crisis-resource interrupt. 

4. Evidence/journal uploads go through the Application plane to S3-compatible storage with server-side encryption; the Application plane stores only a reference and metadata in Postgres, never the file content itself. 

5. Background workers (a job queue — e.g., a Rust-native or simple Redis-backed queue) handle async tasks: journal summarization, PDF export generation, and scheduled dataretention jobs that purge data per the policy in Section 10.5. 

Page 26 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **8.5 Security & Privacy Architecture** 

This expands the original document's brief “Security” section into concrete mechanisms, since for this product privacy is not a feature category but the precondition for the product working at all (Section 2.3). 

- **Anonymous accounts:** no real name, phone number, or email required to use AI Companion, Journal, or Knowledge Platform features. A pseudonymous identifier (generated, not user-chosen, to avoid accidental self-doxxing through a chosen username) is sufficient. Phone/email is only collected, with explicit separate consent, when a user opts into a feature requiring it (booking a paid professional session, or in Section 9.4's optin human-escalation pathway). 

- **Encryption at rest and in transit:** TLS everywhere in transit; at rest, journal and evidence content encrypted using envelope encryption with per-user data encryption keys, so a database compromise alone does not expose plaintext content. 

- **Encrypted evidence storage with chain-of-custody metadata:** each uploaded file stores a cryptographic hash at upload time, alongside upload timestamp and (optionally, user-controlled) device metadata, so that if a user later needs to demonstrate to their own lawyer that a file hasn't been altered since upload, that's verifiable — directly relevant to Section 15.1's evidence-admissibility discussion. 

- **Role-based access control:** internal admin/support access to any user content is logged, requires a documented business justification, and should default to not being possible at all for journal/evidence content except via a break-glass procedure reserved for legal compulsion or active safety emergencies, reviewed in Section 15.3. 

- **No third-party analytics/ad SDKs in any flow touching journal, evidence, or AI Companion conversation content:** this is the BetterHelp lesson from Section 6.1 applied directly — generic product analytics (e.g., page views, feature usage counts) are fine; anything that could let a third party infer or receive conversation content is not, full stop. 

- **Data minimization in AI calls:** if a third-party LLM API (e.g., OpenAI, per the original stack) is used, contractual terms must confirm no training on submitted data, and the orchestration layer should redact or avoid sending unnecessary identifying details to the provider even when the user has provided them elsewhere in the product (e.g., don't include phone number or evidence file content in an LLM prompt for an emotional-support conversation). 

## **8.6 Infrastructure & Deployment** 

- Docker for local development and CI consistency, retained from the original stack. 

- **Kubernetes:** appropriate at scale, but this PRD flags it as likely premature for MVP given a small team; a simpler container-orchestration approach (e.g., a managed container service, or Kubernetes only once multiple services and real traffic justify the operational overhead) is recommended for Phase 1, with Kubernetes adoption gated on actual scaling need rather than built in from day one — consistent with avoiding the over-engineering risk named in 8.1. 

Page 27 of 57 

SAHAY — Master PRD 

Draft v1.0 

- **Cloudflare:** retained — CDN, DDoS protection, and R2 object storage (zero egress fees matter here given evidence file storage/retrieval patterns) are a strong fit and consistent with infrastructure choices already used in Naveen's other projects. 

- **AWS account:** if compute/hosting runs on AWS rather than a Cloudflare-centric stack, the IAM practices already established in Naveen's recent AWS account setup (least-privilege roles, no root-key usage day-to-day) should extend directly to this project, with particular attention to S3 bucket policies for any evidence storage bucket given the sensitivity of contents. 

Page 28 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **9. AI Architecture** 

## **9.1 Emotional Support Agent** 

Provides empathetic, structured conversation; daily check-ins; emotional regulation support; and stress-management guidance, as in the original brainstorm. Two boundaries are added here that the original document didn't specify but that materially affect safety and quality: 

- **Validation without endorsement:** the agent should consistently validate a user's emotional experience (“that sounds genuinely exhausting”) without validating every factual or strategic claim embedded in what they share (“you should confront her tonight” or “your lawyer is definitely wrong about that”). This distinction — common in clinical training, less common in consumer chatbot design — should be an explicit part of the system prompt and should be tested specifically in QA, not assumed to emerge from a general “be empathetic” instruction. 

- **No sycophantic escalation:** the agent must not mirror or amplify hostility toward a specific named person (the user's spouse, in-laws, or opposing party) — it can validate the user's anger and pain without generating content that reads as building a case against, or dehumanizing, the other party. This is both a clinical-quality issue (escalatory mirroring is bad therapeutic practice) and a legal-exposure issue (the platform should not be generating content that could later be characterized as encouraging harassment of the other party). 

- **Daily check-ins and mood tracking:** retained from the original spec; implementation detail — mood data should feed the Crisis Detection Agent (9.4) as one input signal among several, not be the sole trigger, since single-signal crisis detection is both noisier and easier to game (intentionally or not) than multi-signal detection. 

## **9.2 Legal Information Agent — Scope and Hard Boundaries** 

## **This agent carries the platform's highest content-liability risk after crisis detection** 

Purpose, as in the original document: educational legal information, court process guidance, and documentation suggestions — explicitly not legal advice. 

What this means concretely: the agent can explain what an FIR is, what anticipatory bail means, typical statutory timelines, what documents a lawyer will likely ask for, and what BNS/IT Act/PWDVA provisions exist and what they cover in general terms — all sourced from a reviewed, versioned knowledge base (Section 9.2.1), not generated from the model's general training each time, given how much Indian criminal procedure has changed with the BNS/BNSS/BSA 2023 transition and how costly it is for the platform to be confidently wrong about something this consequential. 

What this must never do: assess the merits of a specific user's case (“based on what you've told me, this sounds like it would get dismissed”), predict an outcome, suggest specific wording for a complaint, FIR response, or court filing, or recommend a specific legal strategy (e.g., what to say to police, whether to apply for anticipatory bail). Any user 

Page 29 of 57 

SAHAY — Master PRD 

Draft v1.0 

message that asks for this kind of case-specific strategic guidance should trigger a firm, friendly redirect to the lawyer referral flow (Section 9.5), not a best-effort attempt to answer. 

Every response from this agent should carry a visible, consistent disclaimer and should cite the specific provision or source it's drawing from, both so the user can verify it and so any review process (legal counsel review, Section 7.1 Tier 1) has something concrete to audit. 

## **9.2.1 Knowledge Base Construction (Not Pure LLM Generation)** 

The Legal Information Agent should be built as retrieval-augmented generation (RAG) against a curated, lawyer-reviewed knowledge base, not as an LLM answering legal questions from general training knowledge. Practically: a structured content set (FAQs, process explainers, statute summaries) is written and reviewed by the Tier 1 legal reviewer (Section 7.1), embedded into the vector store (Qdrant or pgvector per Section 8.3), and the agent's job is to retrieve the relevant reviewed content and present it conversationally — with the system explicitly instructed not to answer from outside that retrieved content for anything legal-specific. This is slower and more limited than open generation, and that's the point: it trades some flexibility for the accuracy and auditability this content category requires. 

## **9.3 Abuse Assessment Agent** 

Helps a user recognize patterns of emotional, financial, psychological, or physical abuse and coercive control, as in the original document. Design note: this works best as psychoeducational pattern-matching (“what you're describing — controlling access to money, monitoring your phone, threatening to harm themselves if you leave — are recognized patterns sometimes called coercive control; here's what that means and why it's not your fault”) rather than a checklist-style “abuse score,” which risks feeling clinical, reductive, or like the platform is passing judgment on the user's relationship rather than helping him understand his own experience. This agent should be tightly integrated with 9.1 (Emotional Support) rather than feel like a separate, colder diagnostic tool. 

## **9.4 Crisis Detection Agent — Full Specification** 

This is the single most safety-critical component in the platform and the one where the gap between the original brainstorm's framing (“Full AI crisis detection with auto-escalation to helplines,” per the scoping conversation that opened this PRD) and a responsible implementation needs to be made explicit and concrete. 

## **9.4.1 What “Auto-Escalation” Means Here** 

## **Auto-surfacing, not autonomous third-party contact** 

When the system detects signals consistent with elevated risk (specific language patterns, explicit statements of suicidal ideation, sudden disengagement after high-distress content, or user-reported crisis-screening responses), it immediately and automatically surfaces crisis resources directly in the conversation — Tele-MANAS's number (14416) prominently, 

Page 30 of 57 

SAHAY — Master PRD 

Draft v1.0 

with a one-tap call or connect action, alongside any other relevant resource (Section 9.4.3). This happens automatically, without requiring the user to ask, and without a delay. This is the 'auto' in 'auto-escalation' that this PRD commits to. 

What does NOT happen automatically: the system does not contact a third party (a family member, an emergency service, the platform's own staff) on the user's behalf without the user's affirmative action. The user can choose to tap 'connect me now' to be routed to TeleMANAS or another live human responder — that's the escalation path, and it should be as frictionless as possible — but the platform does not unilaterally decide to call someone for the user. The reasoning, covered in the original scoping discussion, holds: silent or unilateral third-party contact a user didn't choose is a serious trust violation for a platform whose entire value proposition rests on the user feeling safe to disclose, and it creates real legal and ethical complexity (wrongful-disclosure risk, uncertain duty-to-warn standards under Indian law, which has no settled equivalent to US Tarasoff-style doctrine) that this PRD is not positioned to resolve without dedicated legal counsel input. 

This boundary should be revisited, with counsel and clinical partner input, once real usage data and partnership infrastructure exist — it is a v1 design decision, not a permanent philosophical position. 

## **9.4.2 Detection Approach** 

- Multi-signal, not single-keyword: combines a real-time classifier pass on each user message (looking for explicit ideation language, method/plan language, hopelessness markers) with session-level signals (sudden mood-tracker drops, journal entries flagged by sentiment analysis, disengagement patterns) rather than relying on the LLM's own judgment alone, which is not reliably calibrated for this specific task without dedicated tuning and clinical validation. 

- Validated against, not invented by, clinical literature: the specific signal set and thresholds must be designed with the Tier 1 clinical reviewer (Section 7.1), referencing established screening approaches (e.g., the kind of structured risk indicators used in validated tools like the Columbia-Suicide Severity Rating Scale, adapted thoughtfully for a conversational context, not lifted wholesale) rather than engineered ad hoc by the product team. 

- Conservative bias on uncertainty: when signals are ambiguous, the system should err toward surfacing resources gently (a soft, non-alarming check-in plus visible resource availability) rather than either ignoring weak signals or triggering a jarring full crisis interrupt for borderline cases — over-triggering has its own cost (user trust erosion, feeling surveilled) that must be weighed against under-triggering. 

## **9.4.3 Resource Stack** 

|**Resource**|**Type**|**Role in escalation flow**|
|---|---|---|
|Tele-MANAS (14416 / 1800-<br>891-4416)|Govt., 24/7, free, 20<br>languages|Primary, default surfaced resource for all<br>crisis signals|
|KIRAN Mental Health Helpline<br>(1800-599-0019)|Govt., 24/7, free|Secondary/alternate government<br>resource|



Page 31 of 57 

SAHAY — Master PRD 

Draft v1.0 

|**Resource**|**Type**|**Role in escalation flow**|
|---|---|---|
|State/local police emergency<br>(112)|Emergency services|Surfaced only for explicit imminent-<br>danger-to-self-or-others language, with<br>clear framing|
|Platform's own future helpline<br>(Phase 7 / long-term)|Org-run, once<br>established|Not part of MVP; only added once<br>clinically staffed and validated|



Note: KIRAN's continued operating status should be verified at implementation time, since government helpline numbers and operating status can change; this table should be treated as a starting point requiring a verification pass immediately before launch, not a permanently fixed reference. 

## **9.4.4 What MVP Actually Ships** 

Given the Tier 1 research gate (Section 7.1) requiring clinical review before any crisis flow ships, the realistic MVP sequencing is: ship the resource-surfacing flow described in 9.4.1 (which is genuinely “auto-escalation” in the safe sense defined above) as part of MVP, since this is implementable safely and quickly with off-the-shelf, well-validated resources (Tele-MANAS) and conservative detection; treat any more sophisticated detection tuning, the opt-in humanescalation pathway's full design, and any direct platform-staffed crisis response as Phase 2+ work explicitly contingent on the clinical partnership materializing. This satisfies the spirit of “full AI crisis detection with auto-escalation” from day one while keeping the riskiest, least-validated parts of that vision appropriately gated. 

## **9.5 Journal Assistant** 

Summarizes journal entries, generates incident timelines, organizes evidence references, and can produce a structured incident report export, as in the original document. Design note: outputs here should be framed and exported as “user's personal notes, organized,” not as anything resembling a formal legal document or affidavit — the distinction matters both legally (an AI-organized personal timeline is very different from a legal filing, and presenting it as the latter risks both inaccuracy and unauthorized-practice-of-law concerns) and practically (a user's own lawyer will want to review and reshape this material into whatever the actual proceeding requires, not receive it as a finished product). 

## **9.6 Resource Recommendation Agent** 

Suggests nearby lawyers, therapists, NGOs, and crisis centres, as in the original document. This functions less as a generative AI agent and more as a well-built recommendation/search system over the curated, vetted directory described in Section 9.7 of the Functional Requirements — the AI's role is mainly natural-language query understanding (“I need someone who handles custody cases near Indiranagar”) layered over structured directory data, not free generation of professional recommendations, which would carry obvious risk of recommending unverified or even fictional providers. 

Page 32 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **9.7 AI Orchestration & Provider Strategy** 

- **Provider abstraction:** the orchestration layer (Section 8.4) should not hard-couple to a single LLM provider, both for resilience and because pricing/capability leadership shifts over time; OpenAI as specified in the original stack is a reasonable default, with the system designed so a provider swap or multi-provider routing (e.g., a faster/cheaper model for simple check-ins, a stronger model for nuanced legal-knowledge-base retrieval synthesis) is a configuration change, not a rewrite. 

- **Open-source models — realistic framing:** the original document lists “future opensource models” as a stack item. Given Naveen's own hands-on experience evaluating local LLM hardware constraints (a 6GB VRAM laptop running a small quantized model), the realistic near-term role for open-source/self-hosted models in this product is narrow, well-defined tasks — a fine-tuned classifier for the crisis-detection signal layer (9.4.2), or a lightweight model for low-stakes tasks like generating check-in prompts — rather than the primary conversational agent, where current frontier hosted models substantially outperform what's practically self-hostable at this team's scale. This should be revisited as both the team's infrastructure and open-weight model quality evolve, but should not be an MVP dependency. 

- **Hallucination mitigation:** applies across all agents, but matters most for 9.2 (Legal) and 9.6 (Resource Recommendation): retrieval-grounding (cite the source, don't generate from parametric memory) for factual/legal content; a structured, database-backed directory (not free generation) for professional recommendations; and a standing QA process (Section 7.1, ongoing) that periodically red-teams the system with edge-case prompts designed to elicit overconfident or fabricated answers. 

Page 33 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **10. Database Design** 

## **10.1 Core Entities** 

Presented as entity summaries rather than full DDL, since exact schema will evolve during implementation; the relationships and sensitivity classifications below are the part that should remain stable and inform implementation choices. 

## **users** 

- id (UUID, primary key, system-generated — never derived from any identifying input) 

- pseudonymous_handle (system-generated, not user-chosen, to prevent accidental selfidentification) 

- auth_method (anonymous-session | phone-verified | email-verified) — most users remain anonymous-session indefinitely; upgrade is opt-in only 

- phone / email (nullable; populated only on explicit opt-in for features requiring it; stored encrypted, separate from the rest of the profile to minimize blast radius if this table is ever compromised) 

- created_at, last_active_at, data_retention_preference 

_Sensitivity: high (linkage risk even though minimal PII). Access: standard app access for the user's own record only; no cross-user query capability in application code._ 

## **journal_entries** 

- id, user_id (FK), created_at, mood_score (nullable), content_encrypted (envelopeencrypted, per-user DEK), entry_type (free-text | structured-incident | check-in-response) 

_Sensitivity: critical. This is the most sensitive table in the system. Encrypted at rest with per-user keys; never sent to the LLM provider in full without explicit user action (e.g., requesting a summary); never included in any analytics export, even aggregated, without a specific, reviewed justification._ 

## **incidents** 

- id, user_id (FK), incident_date, description_encrypted, category (links to the taxonomy in Section 3), linked_evidence_ids (array of FK to evidence_files), linked_journal_entry_ids 

_Purpose: structured timeline entries distinct from free-form journaling, feeding the Journal Assistant's timeline/report generation (Section 9.5). Same sensitivity tier as journal_entries._ 

## **evidence_files** 

- id, user_id (FK), storage_reference (S3/R2 object key, never the file content itself in this table), file_hash_sha256 (for chain-of-custody integrity verification, Section 8.5), uploaded_at, file_type, linked_incident_id (nullable) 

_Sensitivity: critical. Object storage itself should be encrypted server-side; access requires a short-lived signed URL generated per-request, never a permanently public or guessable path._ 

Page 34 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **ai_conversations / ai_messages** 

- conversation_id, user_id (FK), agent_type (emotional-support | legal-info | abuseassessment | crisis | journal-assistant | resource-rec) 

- message_id, conversation_id (FK), role (user | assistant), content_encrypted, created_at, safety_flags (structured, e.g., crisis_signal_triggered: boolean — flag only, not raw classifier reasoning, to limit sensitive-inference storage) 

_Sensitivity: critical, same tier as journal. Retention policy (10.5) applies most consequentially here, since conversation history is both the most useful data for improving the product and the most sensitive to retain indefinitely._ 

## **crisis_events** 

- id, user_id (FK, nullable if user later deletes account — see 10.5), triggered_at, signal_summary (structured/categorical, not raw transcript), resource_surfaced, user_action_taken (none | viewed | connected), resolved_at (nullable) 

_Purpose: this table exists specifically to allow auditing of crisis-detection performance (false positive/negative rates) over time, per the ongoing QA process in Section 9.7 and Section 7.1 Tier 3, without retaining full conversation content longer than necessary. Access to this table should be among the most tightly restricted in the system, reserved for safety-review purposes, not general analytics._ 

## **professionals (lawyers, therapists, financial advisors)** 

- id, name, category, credentials_verified (boolean, with verification_method and verified_at), specializations (array, links to Section 3 taxonomy), location, languages, fee_structure, contact_info, platform_review_status 

_Sensitivity: moderate — this is the directory's supply side, not end-user sensitive data, but credentialverification fields are load-bearing for trust and should be auditable._ 

## **consent_records** 

- id, user_id (FK), consent_type (data-processing | phone-collection | evidence-storage | professional-referral-share), granted_at, revoked_at (nullable), policy_version_at_consent 

_Purpose: DPDPA compliance (Section 15.3) requires demonstrable, granular, revocable consent — this table is the audit trail for that, and is a direct beneficiary of the relational/transactional integrity argument made in Section 8.3 for choosing Postgres._ 

## **10.2 Entity Relationship Summary** 

users (1) → (many) journal_entries, incidents, evidence_files, ai_conversations, consent_records, crisis_events. incidents (many) ↔ (many) evidence_files via linked_evidence_ids. ai_conversations (1) → (many) ai_messages. professionals stands largely independent, referenced by a future referrals/bookings table (Phase 4/6, not detailed at MVP granularity here). 

## **10.3 Vector Store Schema (Knowledge Base & Semantic Search)** 

- knowledge_chunks: id, content, source_citation, content_category (matches Section 3 taxonomy), reviewed_by, reviewed_at, embedding_vector — powers the Legal Information 

Page 35 of 57 

SAHAY — Master PRD 

Draft v1.0 

Agent's RAG retrieval (Section 9.2.1) and, separately, semantic search over a user's own journal entries for the Journal Assistant (a per-user-isolated index, never cross-user). 

## **10.4 Sensitivity Classification Summary** 

|**Table**|**Sensitivity**|**Encryption**|**Retention default**|
|---|---|---|---|
|journal_entries|Critical|Per-user envelope<br>encryption|User-controlled; see<br>10.5|
|incidents|Critical|Per-user envelope<br>encryption|User-controlled; see<br>10.5|
|evidence_files|Critical|Server-side + per-user<br>key|User-controlled; see<br>10.5|
|ai_conversations/<br>messages|Critical|Per-user envelope<br>encryption|Rolling window default;<br>see 10.5|
|crisis_events|Critical, restricted<br>access|Encrypted; access-<br>logged|Longer retention for<br>safety audit,<br>anonymized after<br>window|
|users|High|Field-level for<br>phone/email|Indefinite while account<br>active|
|consent_records|Moderate, audit-<br>critical|Standard|Indefinite (legal<br>requirement)|
|professionals|Moderate (not end-<br>user PII)|Standard|Indefinite while listed|



## **10.5 Data Retention Policy — Draft, Pending Legal Review** 

This is a draft policy framework, explicitly flagged as requiring the Tier 1 data-protection counsel review (Section 7.1) before being finalized or published to users. 

- **User-controlled deletion:** any user can delete their journal entries, incidents, or evidence files individually or in bulk at any time, with deletion meaning actual removal (including from backups within a bounded, disclosed window), not soft-delete-only. 

- **Conversation history default:** a rolling retention window (e.g., 12 months, exact figure pending legal/product review) for ai_conversations content, after which content is either deleted or irreversibly anonymized, with the user able to opt into shorter retention or immediate-delete-after-session at any time. 

- **Crisis event records:** retained longer than general conversation content specifically to support the safety-performance audit function described in 10.1, but with direct useridentifying linkage removed after a defined window, retaining only the anonymized signal data needed for ongoing detection-quality review. 

Page 36 of 57 

SAHAY — Master PRD 

Draft v1.0 

- **Account deletion:** a full “delete my account” action should cascade to remove or irreversibly anonymize all linked tables within a disclosed timeframe (e.g., 30 days), consistent with DPDPA data-principal rights. 

Page 37 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **11. API Specifications** 

## **11.1 API Design Principles** 

- REST over HTTPS, JSON payloads, versioned from day one (/api/v1/...) since this product will iterate on sensitive data shapes and needs a clean deprecation path. 

- The client never calls the LLM provider or object storage directly — every AI and file operation is proxied through the Application plane (Section 8.4), both for security (no provider keys on client) and so every interaction can pass through safety checks (Section 9.4) uniformly. 

- Every endpoint touching journal, evidence, or conversation data requires authentication via the user's session token, scoped to that user's own records only — no admin override path exists in the standard API surface (Section 8.5's break-glass procedure is separate, internal, and logged). 

## **11.2 Authentication** 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/auth/anonymous-<br>session|POST|Creates a new anonymous pseudonymous session;<br>no input required beyond device/client metadata for<br>abuse prevention|
|/api/v1/auth/upgrade|POST|Opt-in upgrade to phone or email-verified, with<br>explicit consent capture (writes to consent_records)|
|/api/v1/auth/session|GET|Validate current session, return pseudonymous<br>handle and account status|
|/api/v1/auth/logout|POST|Invalidate current session token|



## **11.3 AI Companion / Agent Interaction** 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/agent/converse|POST|Primary conversational endpoint. Body: { conversation_id<br>(nullable for new), message, agent_type }. Server<br>determines agent routing, runs safety pre-check, calls<br>orchestration layer, returns { response, safety_interrupt<br>(nullable), citations (for legal-info agent) }|
|/api/v1/agent/<br>conversations|GET|List the user's conversation threads (metadata only, not full<br>content, for list views)|
|/api/v1/agent/<br>conversations/{id}|GET|Retrieve full message history for one conversation|
|/api/v1/agent/<br>conversations/{id}|DELETE|Delete a conversation and its messages permanently|



Page 38 of 57 

SAHAY — Master PRD 

Draft v1.0 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/agent/checkin|POST|Submit a daily check-in / mood entry, feeds mood_score<br>and Crisis Detection signal layer|



Note on /agent/converse response shape: the safety_interrupt field is deliberately separate from response so the client can render crisis resources in a consistent, tested UI component regardless of which agent_type was active or what the underlying AI response was — crisisresource presentation should never depend on correct AI-generated text formatting. 

## **11.4 Journal & Incident Management** 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/journal/entries|POST|Create a journal entry|
|/api/v1/journal/entries|GET|List entries (paginated, decrypted server-side<br>only for the authenticated owner)|
|/api/v1/journal/entries/{id}|PATCH /<br>DELETE|Edit or delete an entry|
|/api/v1/journal/entries/{id}/<br>summarize|POST|Invoke Journal Assistant (Section 9.5) to<br>summarize one or more entries|
|/api/v1/incidents|POST / GET|Create or list structured incident-timeline<br>entries|
|/api/v1/incidents/{id}/export|POST|Generate a PDF export of an incident timeline,<br>framed per Section 9.5's “personal notes,<br>organized” guidance|



## **11.5 Evidence Storage** 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/evidence/upload-url|POST|Returns a short-lived signed URL for direct-to-<br>storage upload; application server never<br>proxies large file bytes itself|
|/api/v1/evidence/files|GET|List the user's evidence files (metadata + hash,<br>not content)|
|/api/v1/evidence/files/{id}/<br>download-url|GET|Returns a short-lived signed URL to retrieve<br>the file|
|/api/v1/evidence/files/{id}|DELETE|Permanently delete a file from storage and its<br>metadata record|



Page 39 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **11.6 Resource Directory** 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/api/v1/directory/search|GET|Query params: category, location, language,<br>specialization; returns vetted professionals/NGOs<br>matching criteria|
|/api/v1/directory/<br>professionals/{id}|GET|Detail view for one listed professional, including<br>verification status|
|/api/v1/directory/crisis-<br>resources|GET|Static/cached list of crisis helplines (Section 9.4.3) —<br>deliberately a simple, fast, high-availability endpoint<br>independent of the AI orchestration layer, since it must<br>work even if AI services are degraded|



## **Availability note** 

/api/v1/directory/crisis-resources deserves special engineering attention: it should be servable from a static cache or CDN edge with no dependency on the database, AI orchestration layer, or any other component that could be the thing that's failing during an outage. A user in crisis should be able to get a helpline number even if the rest of the platform is down. This is a small, cheap engineering investment with an outsized safety payoff. 

Page 40 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **12. Functional & Non-Functional Requirements** 

## **12.1 Functional Requirements by Module** 

## **FR-1: AI Companion** 

- FR-1.1: User can start a conversation with the Emotional Support Agent without any account upgrade beyond anonymous session. 

- FR-1.2: System persists conversation history per-user, retrievable and deletable by the user (Section 11.3). 

- FR-1.3: System surfaces crisis resources automatically per Section 9.4 detection logic, without requiring user request. 

- FR-1.4: User can submit a daily check-in (mood + optional free text) distinct from open conversation. 

- FR-1.5: Abuse Assessment Agent functionality is available within the same conversational surface, not a separate disconnected tool, per Section 9.3's integration guidance. 

## **FR-2: Knowledge Platform** 

- FR-2.1: User can browse and search structured educational content across the Section 3 taxonomy categories without authentication. 

- FR-2.2: Every legal-content article displays its review status, last-reviewed date, and source citations per Section 9.2.1. 

- FR-2.3: Content is organized to be findable both by browsing categories and by naturallanguage query (e.g., via the Legal Information Agent's RAG retrieval). 

## **FR-3: Personal Recovery Workspace (Journal)** 

- FR-3.1: User can create, edit, and delete free-form journal entries. 

- FR-3.2: User can create structured incident entries with date, category, and linked evidence. 

- FR-3.3: User can upload evidence files (images, documents, audio) linked to an incident, per Section 11.5. 

- FR-3.4: User can request an AI-generated summary or timeline of selected entries (Journal Assistant, Section 9.5). 

- FR-3.5: User can export a PDF of their incident timeline, clearly labeled as personal notes rather than a legal document, per Section 9.5. 

## **FR-4: Resource Directory** 

- FR-4.1: User can search vetted professionals by category, location, language, and specialization. 

- FR-4.2: Every listed professional displays verification status and method, per the professionals table schema (Section 10.1). 

Page 41 of 57 

SAHAY — Master PRD 

Draft v1.0 

- FR-4.3: Crisis resources (Section 9.4.3) are always accessible via a persistent, prominent UI element, not buried in a menu. 

## **FR-5: Account & Privacy Controls** 

- FR-5.1: User can view and manage all consent grants (Section 10.1, consent_records). 

- FR-5.2: User can export all their own data in a portable format (DPDPA data-portability alignment, Section 15.3). 

- FR-5.3: User can permanently delete their account and all linked data, per the retention policy in Section 10.5. 

## **12.2 Non-Functional Requirements** 

- **NFR-1 Availability:** crisis-resource endpoint (Section 11.6) target 99.9%+ availability, decoupled from AI/DB dependencies; core platform target 99.5%+ for MVP, appropriate for a small-team-operated service rather than over-committing to enterprise SLAs prematurely. 

- **NFR-2 Latency:** AI Companion conversational responses should target sub-3-second time-to-first-token for a reasonable user experience; crisis-detection safety checks (Section 9.4.2) must not meaningfully increase this latency, which argues for a fast, lightweight classifier pass rather than a second full LLM call in the critical path. 

- **NFR-3 Data residency:** given the sensitivity of the data and DPDPA considerations (Section 15.3), production data storage should default to a data residency option that keeps Indian user data within India where the chosen infrastructure provider supports it, even if this is not yet a strict legal requirement for all data categories at MVP scale — starting compliant is cheaper than migrating later. 

- **NFR-4 Accessibility:** given the target demographic's likely device profile (mid-range Android phones, variable connectivity), the web app should be performance-budgeted for low-end devices and degraded network conditions, not designed and tested only on highend hardware. 

- **NFR-5 Auditability:** every safety-relevant system decision (crisis flag triggered, content served by Legal Information Agent) should be logged in a form that supports the ongoing QA/red-teaming process (Section 9.7) without itself becoming a new sensitive-data exposure risk — logging the decision and its category, not necessarily the full raw input that triggered it. 

Page 42 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **13. UX Flows (Key Journeys)** 

## **13.1 First-Time User: Anonymous Onboarding to First Disclosure** 

1. Landing page communicates anonymity and privacy commitments before asking for anything — this is the highest-leverage trust-building moment in the entire product and should not be rushed past in favor of a generic signup flow. 

2. Anonymous session created silently (FR-1.1); no form, no email, no phone. 

3. Light, low-pressure entry point — a simple prompt like “What's on your mind?” rather than an intimidating intake questionnaire, consistent with the AI-native opportunity described in Section 4.2 (lowering activation energy for first disclosure). 

4. Conversation proceeds with the Emotional Support Agent; if the user's message contains content matching Legal Information or Abuse Assessment territory, the system can surface relevant Knowledge Platform content inline as a suggestion, not a forced redirect. 

5. At a natural point (not interrupting active distress), the product can surface an optional, low-pressure prompt to start a journal entry from the conversation — turning a single disclosure into the beginning of a documented record, with the user firmly in control of whether that happens. 

## **13.2 Crisis Signal Detected Mid-Conversation** 

1. User message or session pattern triggers a crisis signal (Section 9.4.2). 

2. The AI's own conversational response continues warmly and appropriately — it does not become clinical or robotic — while the safety_interrupt UI component (Section 11.3) renders simultaneously, surfacing Tele-MANAS and other resources prominently, with a one-tap connect option. 

3. The interrupt does not block or end the conversation; the user can continue talking to the AI Companion and separately choose whether to act on the surfaced resource, on their own timeline. 

4. If the user takes the connect action, a crisis_events record is created (Section 10.1) for safety-performance tracking; if they don't, the resource remains pinned/accessible for the remainder of the session without re-triggering the interrupt repeatedly in a way that feels alarming or repetitive. 

## **13.3 Legal Information Request → Lawyer Referral** 

1. User asks the AI Companion something with legal content (e.g., “what happens after an FIR is filed against someone”). 

2. System routes to the Legal Information Agent (Section 9.2), retrieves and presents reviewed knowledge-base content with citations, clearly labeled as educational information. 

Page 43 of 57 

SAHAY — Master PRD 

Draft v1.0 

3. If the user's follow-up asks for case-specific strategic advice (Section 9.2's hard boundary), the agent declines that specific request warmly, explains why (not because the platform doesn't care, but because this requires someone who can actually review his specific situation), and offers the Resource Directory lawyer-search flow as the next step. 

4. Resource Directory search (FR-4.1) surfaces vetted family/criminal lawyers by location and specialization; user can save or contact directly, with no platform fee at MVP stage (Section 14, MVP scope) keeping this a pure trust-building referral rather than a monetized funnel until the directory's quality is established. 

## **13.4 Journal-to-Evidence Workflow** 

1. User creates a structured incident entry (date, category, description) from the Journal module. 

2. User optionally uploads supporting evidence (a screenshot, a message export, a photo) directly linked to that incident, via the signed-upload-URL flow (Section 11.5). 

3. System computes and stores the file hash at upload (Section 8.5) for later integrity verification. 

4. Over time, the user can request a Journal Assistant-generated timeline summary across multiple linked incidents (Section 9.5), and export it as a PDF clearly framed as personal documentation, suitable to bring to a lawyer rather than as a legal filing itself. 

Page 44 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **14. Risk Assessment** 

Risks are scored qualitatively (Likelihood × Impact, both Low/Medium/High) and paired with the specific mitigation already designed into earlier sections, or flagged where a mitigation still requires external input (legal counsel, clinical partner) this PRD cannot resolve alone. 

## **14.1 Safety & Clinical Risks** 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|Crisis Detection Agent false negative —<br>misses a genuine high-risk signal|Med ×<br>High|Multi-signal detection (9.4.2),<br>conservative-bias-on-uncertainty default,<br>clinical review gate before launch (7.1<br>Tier 1), ongoing audit via crisis_events<br>table (10.1)|
|Crisis Detection false positive — over-<br>triggers, erodes trust or feels surveillant|Med ×<br>Med|Non-alarming soft-interrupt design (13.2),<br>pinned-not-repeated resource display,<br>clinical tuning over time|
|AI Companion inadvertently reinforces<br>harmful framing (e.g., validates a plan to<br>confront an alleged abuser in person)|Med ×<br>High|Validation-without-endorsement boundary<br>(9.1), system prompt discipline, red-team<br>QA (9.7)|
|User in active crisis has no connectivity /<br>app fails at the critical moment|Low ×<br>High|Crisis-resources endpoint engineered for<br>independent high availability (11.6)<br>decoupled from AI/DB|



## **14.2 Legal & Content Risks** 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|Legal Information Agent gives inaccurate or<br>outdated process information (esp. post-<br>BNS/BNSS/BSA transition content)|Med ×<br>High|RAG-grounded, lawyer-reviewed<br>knowledge base only (9.2.1), no open<br>generation on legal specifics, visible<br>review-date display (FR-2.2)|
|Platform perceived as practicing law without a<br>license / unauthorized legal advice|Med ×<br>High|Hard boundary against case-specific<br>strategic guidance (9.2), consistent<br>disclaimers, redirect-to-lawyer flow<br>(13.3)|
|Content drifts toward one-sided/advocacy<br>framing over time as contributors or<br>community content scale|Med ×<br>High|Editorial policy explicit from day one<br>(5.3, 6.3), citation discipline, no “misuse<br>statistics” campaigns, ongoing review<br>process|
|Evidence stored on platform is later challenged<br>as tampered/inadmissible|Low ×<br>Med|Hash-based integrity verification at<br>upload (8.5), clear framing as personal<br>documentation not a legal exhibit (9.5)|
|Journal/Incident export mistaken by a user or|Low ×|Explicit “personal notes, organized”|



Page 45 of 57 

SAHAY — Master PRD 

Draft v1.0 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|court for a formal legal document|Med|labeling on every export (9.5, FR-3.5)|



## **14.3 Privacy & Data Risks** 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|Data breach exposes journal/evidence content|Low ×<br>Critical|Per-user envelope encryption (8.5,<br>10.4), no plaintext at rest,<br>restricted/logged admin access|
|Re-identification of a pseudonymous user via<br>metadata or pattern|Med ×<br>High|Minimal metadata collection, no third-<br>party analytics SDKs on sensitive flows<br>(8.5), device-metadata minimization|
|DPDPA non-compliance at enforcement<br>deadline (full compliance required by May<br>2027 per phased rollout)|Med ×<br>High|Data protection counsel review gate<br>(7.1 Tier 1) before any data collection,<br>consent_records architecture (10.1)<br>built for compliance from day one<br>rather than retrofitted|
|Third-party LLM provider trains on or retains<br>sensitive conversation data|Low ×<br>Critical|Contractual no-training terms required<br>(8.5), data minimization in prompts sent<br>to provider|
|Law enforcement or court compels disclosure<br>of a user's journal/evidence data|Low ×<br>High|This is a genuine open question<br>requiring counsel input — see 15.3;<br>encryption design and minimal<br>retention reduce what could ever be<br>disclosed, but a clear, honest,<br>published policy on how the platform<br>would respond to a lawful compulsion<br>request is needed before launch, not<br>an afterthought|



## **14.4 Reputational & Positioning Risks** 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|Platform conflated with existing men's-rights<br>advocacy ecosystem (6.3) by media, partners,<br>or critics|High ×<br>High|Explicit differentiation in public<br>materials from day one (6.3), neutral<br>framing discipline (5.3), avoid the<br>specific debunked statistics named in<br>2.4|
|Platform criticized as anti-women or<br>minimizing genuine domestic violence against<br>women|Med ×<br>High|Mission/positioning explicitly additive<br>not oppositional (1.4, 5.1), no content<br>or marketing that frames women's<br>protections as the problem, transparent<br>citation of contested vs. settled facts<br>throughout|



Page 46 of 57 

SAHAY — Master PRD 

Draft v1.0 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|A user-generated or AI-generated piece of<br>content goes viral for the wrong reasons (e.g.,<br>perceived as victim-blaming or as encouraging<br>false-allegation narratives)|Med ×<br>High|Pre-publication legal/content review<br>(7.1), no open community content at<br>MVP (Phase 5 community is explicitly<br>deferred, 12 / 16), AI output boundaries<br>(9.1, 9.2)|
|Funding/partnership conversations stall<br>because the product appears, even<br>unintentionally, gender-adversarial|Med ×<br>Med|Lead pitch materials with the additive<br>framing and real NCRB data (2.4), not<br>emotionally charged anecdotes alone|



## **14.5 Business & Execution Risks** 

|**Risk**|**L × I**|**Mitigation**|
|---|---|---|
|Solo/small-team bandwidth insufficient given<br>Naveen's existing PayTech role and multiple<br>concurrent ventures|High ×<br>Med|Phased, narrow MVP scope (Section<br>16), explicit sequencing that defers the<br>highest-effort items (community,<br>professional marketplace) until core<br>value is validated|
|Monetization conflicts with trust (e.g.,<br>paywalling crisis-adjacent features)|Med ×<br>High|Free-tier commitment for AI Companion<br>core functions (17.2), monetization<br>concentrated in directory/professional-<br>booking and B2B/CSR channels<br>instead|
|Low initial trust/adoption given a new,<br>unknown brand in a high-stigma category|High ×<br>Med|NGO/CSR partnership pursued in<br>parallel (5.2, 17), Tele-MANAS-style<br>government-credibility-adjacent<br>positioning where possible, slow<br>validated rollout over broad launch|



Page 47 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **15. Legal & Ethical Considerations** 

## **15.1 Evidence Handling and Admissibility** 

India's evidentiary framework for electronic records sits primarily in the Bharatiya Sakshya Adhiniyam, 2023 (BSA, the BNS-era replacement for the Indian Evidence Act, 1872), which retains and updates the earlier Section 65B-style requirements for electronic evidence — broadly, that electronic records require an accompanying certificate attesting to how the record was produced and that it accurately reflects the original, in order to be admissible without separately producing the original device. This has two direct implications for the platform's evidence-storage design (Section 8.5, Section 10.1): 

- **The platform cannot promise admissibility:** no UI copy, marketing material, or in-app messaging should imply that uploading evidence to the platform makes it “court-ready” or automatically admissible. What the platform can credibly promise is integrity preservation (the hash-based chain-of-custody approach in 8.5) and organized accessibility — useful inputs to a lawyer preparing the actual certification and filing, not a substitute for that process. 

- **Hash verification is a genuine, modest value-add:** storing a cryptographic hash at the moment of upload, and being able to demonstrate a file hasn't been altered since that moment, is a real and useful (if partial) contribution to the kind of integrity attestation a BSA certificate ultimately needs to make — framed honestly as one input among several, not as the certificate itself. 

## **15.2 Unauthorized Practice of Law — The Line This Platform Must Hold** 

## **Why this is treated as a hard architectural constraint, not just a disclaimer** 

India restricts the practice of law to enrolled advocates under the Advocates Act, 1961, and “practice” in this context generally concerns appearing for or advising a specific party in a specific matter, not the publication of general legal information — which is why explainer content, legal journalism, and legal-tech educational platforms are able to operate. The Legal Information Agent (Section 9.2) is designed to stay clearly on the educational side of that line: explaining what the law generally says and what a process generally involves, never assessing the merits of, or recommending a strategy for, a specific user's specific dispute. 

The practical risk is not primarily that this distinction is conceptually unclear — it's well understood in the legal-tech space — but that an LLM-based agent, asked a sufficiently specific question by a distressed user, can drift into case-specific-sounding language even when instructed not to (“based on what you've described, you'd likely qualify for anticipatory bail” crosses the line; “here's what anticipatory bail generally is and when courts typically consider it” does not). This is why Section 9.2 specifies RAG-grounding against reviewed content and a firm redirect behavior for case-specific requests, rather than relying on system-prompt instructions alone, which LLMs do not reliably honor under all phrasings of a 

Page 48 of 57 

SAHAY — Master PRD 

Draft v1.0 

request. 

## **15.3 Data Protection — DPDPA Compliance Posture** 

The Digital Personal Data Protection Act, 2023 (DPDPA) and its implementing Rules — notified by MeitY in November 2025, with phased enforcement running through a full-compliance deadline in May 2027 — are the controlling framework, and this PRD's data architecture (Sections 8.5, 10) was designed with it in mind from the start rather than as a retrofit. 

- **One important nuance worth getting right in any pitch or compliance material:** unlike GDPR, the DPDPA does not create a separate, more heavily regulated category of “sensitive personal data.” It applies a single, uniform standard to all digital personal data. This doesn't reduce the platform's obligation to protect journal/evidence/conversation content — it remains the most consequential data this product holds, and the encryption, minimization, and access-control architecture in Section 8.5 should be built to a higher bar than DPDPA strictly mandates, both because it's the right thing to do for this user base and because heightened protection is a meaningful trust and differentiation signal regardless of the statutory minimum. 

- **Data Fiduciary obligations directly relevant here:** valid, specific, informed, unconditional, and unambiguous consent before processing (the consent_records architecture in Section 10.1 is built for exactly this); processing limited to declared purposes; reasonable security safeguards; and timely breach notification to the Data Protection Board of India and affected users. 

- **Significant Data Fiduciary (SDF) status:** the government can designate any data fiduciary as an SDF based on volume and sensitivity of data processed, triggering additional obligations (India-based Data Protection Officer, annual Data Protection Impact Assessments, independent audits, possible data-localization requirements). This platform may plausibly be designated an SDF given the sensitivity of the data it processes even at moderate user volume — worth flagging early to legal counsel (Section 7.1) rather than discovering at scale. 

- **Cross-border data transfer:** the original stack's reliance on a US-headquartered LLM provider (OpenAI) means user-derived content does cross borders for processing. NFR-3 (Section 12.2) already recommends defaulting to India-resident storage for the data itself; the AI-prompt content sent to the provider should be minimized (Section 8.5) precisely because it's the piece of the data flow least within the platform's direct control. 

- **Government/law-enforcement data requests:** this PRD does not attempt to resolve, on its own, exactly how the platform should respond to a lawful compulsion order for user data — that requires Indian counsel input specific to this product (flagged as an open item in Section 14.3). What this PRD does commit to architecturally: minimizing what exists to disclose in the first place (retention limits, Section 10.5), and publishing a clear, honest transparency policy on this topic before launch rather than leaving it ambiguous, since ambiguity here is itself a trust risk for users weighing whether to disclose sensitive material. 

Page 49 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **15.4 Positioning, Editorial Independence, and the Gender-Debate Tightrope** 

This section makes explicit what Sections 1.4, 5.3, and 6.3 established implicitly: the single largest non-technical risk to this platform's credibility is being correctly or incorrectly perceived as part of the existing adversarial men's-rights advocacy ecosystem rather than as a neutral support and information service. 

- **Editorial policy commitments:** no content asserting or implying that allegations against men are generally false or exaggerated as a class; no aggregated “misuse” statistics campaigns; no content framing existing protections for women (PWDVA, BNS cruelty provisions, POSH Act) as themselves the problem to be solved; every statistical claim traceable to a named, citable source, with the discipline modeled in Section 2.4 applied platform-wide, indefinitely, not just in this founding document. 

- **Where the platform should and shouldn't take positions:** the platform can and should state what current law is, what current data shows, and what process exists — these are facts, not positions. It should not take an institutional position on what the law should become (e.g., whether BNS 85/86 should be made gender-neutral, whether the PWDVA should be extended to men). Individual users, professionals in the directory, or community members (once Phase 5 ships) may hold and express such views; the platform's own institutional voice should not, both because it would compromise the trust required from a broad range of partners and because it is not this product's purpose, which is support and access, not legislative reform. 

- **Who should review this positioning over time:** as the platform scales and especially once any human-staffed function (counsellors, community moderators, content contributors) is added, this editorial line requires active, ongoing enforcement — a single founding document's good intentions do not self-execute. A lightweight editorial review process, even informally with one trusted outside reviewer, is recommended from the point any third party starts contributing content. 

## **15.5 AI Safety, Liability, and Professional Standards** 

- **No diagnosis, no treatment, no therapy:** the platform's AI Companion and Abuse Assessment Agent provide support, psychoeducation, and triage — not clinical diagnosis or treatment, which would require licensed mental-health professionals and trigger an entirely different (and currently out-of-scope) regulatory regime under India's Mental Healthcare Act, 2017. This boundary should be reflected in user-facing language consistently (“I'm not able to diagnose what you're describing, but I can help you understand it and find someone who can,” not clinical-sounding assessment language). 

- **Liability for AI-generated content:** Indian law on AI-specific liability is still developing and largely untested in court for products like this one; the most defensible posture available today is the one this PRD has built throughout — grounding high-stakes content (legal, crisis) in reviewed, citable sources rather than open generation, maintaining audit trails (crisis_events, Section 10.1), and treating professional review (Section 7.1 Tier 1) as 

Page 50 of 57 

SAHAY — Master PRD 

Draft v1.0 

a genuine gate, not a formality, since a documented, good-faith safety process is the strongest available protection in an area without settled case law. 

- **Vulnerable-user considerations:** users of this platform are, by definition, in some state of distress, which raises the bar for what counts as acceptable AI behavior compared to a general-purpose product — dark patterns, engagement-maximizing design, or anything that could read as exploiting distress for retention or monetization (Section 14.5) should be treated as categorically unacceptable, not just suboptimal. 

## **15.6 Open Items Requiring Counsel Before Launch** 

**This is a checklist, not a complete legal analysis — treat as a starting brief for the Tier 1 legal/data-protection review (Section 7.1)** 

Confirm whether the platform's processing volume/sensitivity is likely to trigger Significant Data Fiduciary designation, and what that means for launch timeline and cost. 

Draft and have counsel review a public-facing policy on responding to law-enforcement or court data requests. 

Confirm Terms of Service language on the educational-not-advice boundary for both legal and mental-health content is enforceable and clear under Indian consumer-protection norms. 

Confirm the entity structure (private limited vs. Section 8 not-for-profit vs. hybrid, see Section 17) before any user data collection begins, since this affects DPDPA fiduciary obligations and fundraising structure simultaneously. 

Review duty-of-care exposure specific to the crisis-detection auto-surfacing design (Section 9.4) — confirm the chosen boundary (surface resources automatically, but don't autocontact third parties without user action) is the right balance given current Indian legal context, which lacks settled duty-to-warn doctrine. 

Page 51 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **16. MVP Definition & Engineering Roadmap** 

## **16.1 MVP Scope — What Ships First** 

Carried forward from the original document's MVP list, with the Crisis Detection and Legal Information boundaries from Sections 9.2 and 9.4 applied, and explicitly sequenced against the Tier 1 research gates in Section 7.1. 

- **✓ AI Companion (Emotional Support + Abuse Assessment, integrated):** ships at MVP. Highest standalone value, lowest legal/clinical risk of the AI components, per Section 14.1/14.2. 

- **✓ Crisis resource auto-surfacing (not full clinical escalation infrastructure):** ships at MVP, gated on Tier 1 clinical review (7.1) of detection signals and resource list, per the scoping in Section 9.4.4. 

- **✓ Knowledge Platform (educational content):** ships at MVP for the categories with the clearest, lowest-risk existing law (cyber abuse, elder abuse per Section 3.8/3.9); custody and sexual-offence content (Section 3.4/3.7) should not ship until legal review (7.1 Tier 1) is complete even if that means a narrower content set at launch. 

- **✓ Private Journal + Mood Tracking:** ships at MVP, core differentiator, comparatively low external-dependency risk. 

- **✓ Anonymous Authentication:** ships at MVP as the default and only required auth method, per Section 8.5. 

- **○ Resource Directory:** ships at MVP in a deliberately minimal form — a small, handvetted starter list (even a few dozen professionals personally vetted rather than an open marketplace) rather than the full self-serve listing/booking system, to avoid shipping unverified listings before a real verification process (Section 10.1) is operational. 

- **✗ Legal Information Agent (full RAG system):** deferred to immediately post-MVP (Phase 1.5) rather than MVP day one, since it requires the legal-content review pipeline (7.1, 9.2.1) to exist first; MVP can launch with the narrower Knowledge Platform content above and add the full conversational legal agent once that pipeline is proven out. 

- **✗ Evidence storage:** deferred to Phase 1.5/2, immediately after Journal — the encryption and chain-of-custody architecture (8.5) is more involved to get right than text journaling, and shipping it slightly later rather than rushing it is the safer sequencing given how consequential a mistake here would be. 

## **16.2 Phased Roadmap** 

## **Phase 1 — AI Companion Core (Months 1–3)** 

- Anonymous auth, Emotional Support + Abuse Assessment agent, mood check-ins, crisisresource auto-surfacing (gated on clinical review), narrow Knowledge Platform content (cyber/elder abuse categories), basic Journal (text only, no evidence upload yet). 

Page 52 of 57 

SAHAY — Master PRD 

Draft v1.0 

- Parallel track: Tier 1 research gates (7.1) — clinical reviewer engaged, legal reviewer engaged, data protection counsel engaged — should start in Month 1, not after build begins, since they gate later phases. 

## **Phase 1.5 — Documentation & Legal Education (Months 3–5)** 

- Evidence storage (encrypted upload, hash verification), incident timeline tooling, Journal Assistant summarization, full Legal Information Agent (RAG-grounded) with expanded reviewed content covering the remaining Section 3 categories as legal review clears them. 

## **Phase 2 — Resource Directory Expansion (Months 5–7)** 

- Self-serve professional listing with a real verification workflow (not just founder-vetted), search/filter by specialization and location, booking-intent capture (not necessarily in-app payment yet). 

## **Phase 3 — Community (Months 7–10), Cautiously** 

- Per the original document's Phase 5. This is intentionally placed later and built cautiously: anonymous discussion forums and peer support carry real moderation and editorial-lineenforcement risk (Section 15.4) at exactly the moment the platform might have enough traction for that risk to matter publicly. Recommend launching with active, real-time human moderation from day one of this phase, not automated-only moderation, and recommend a much smaller, invite-based pilot community before any open forum. 

## **Phase 4 — Professional Services & Monetization Maturity (Months 10–14)** 

- In-app booking/payment for verified professionals, financial advisor and mediator categories added to the directory, B2B/CSR partnership integrations (per Section 17). 

## **Phase 5+ — Institutional Build-Out (Year 2+)** 

- Not-for-profit/Section 8 registration process (if not initiated earlier in parallel, per Section 17.1), formal helpline exploration only once a genuine clinical-staffing partnership exists, research publication function, advocacy positioning revisited only with significant institutional credibility already established. 

## **16.3 Engineering Team Shape (Realistic for Solo/Small-Team Start)** 

Given the stated context — Naveen building this alongside a full-time DevOps/MLOps role at PayTech Group and multiple other ventures — Phase 1 is realistically a solo-plus-contractor build: Naveen as architect/lead engineer (a strong fit given the Rust/Axum, Kubernetes, and AWS experience already established in other projects), with the Tier 1 research-gate professionals (clinician, lawyer, data-protection counsel) engaged as paid consultants or advisors rather than full-time hires at this stage, and possibly one contracted frontend/productdesign collaborator given the trust-critical nature of the onboarding UX (Section 13.1). Expanding beyond this shape should be tied to either funding (Section 17) or NGO/CSR partnership materializing, not attempted prematurely. 

Page 53 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **17. Business Model & Go-to-Market** 

## **17.1 Entity Structure — A Decision That Shapes Everything Else** 

The original document listed NGO, social enterprise, freemium, CSR partnerships, donations, grants, and premium consultations as possible models without resolving how they fit together. This PRD recommends a specific structure rather than leaving it open, because the entity choice affects DPDPA fiduciary obligations (Section 15.3), fundraising eligibility, and public trust simultaneously. 

- **Recommended: a hybrid structure, mirroring the Wysa precedent (Section 6.1) and common in this space —** a for-profit private limited company holding the core technology and any monetized professional-directory/B2B functions, with a path toward an affiliated Section 8 not-for-profit company for the helpline, advocacy, and research functions once those are pursued (Section 16.2, Phase 5+). This lets the platform accept early-stage equity investment to fund engineering (realistic given the build complexity in Sections 8– 11) while keeping the door open to grant funding, CSR partnerships, and donation-based support for the parts of the mission that are inherently not commercially monetizable (a free crisis-resource function should never be gated behind unit economics). 

- **Why not pure NGO from day one:** a pure not-for-profit structure constrains the speed and type of capital available for the kind of focused, fast technical build this product needs in Phase 1, and Naveen's stated context (solo/small-team build, existing technical infrastructure and SaaS-building experience) is a better fit for a startup-style build first, institutional credibility second — the reverse of trying to build NGO governance structures before there's a product worth governing. 

## **17.2 Revenue Model** 

- **Free, indefinitely:** AI Companion (Emotional Support, Abuse Assessment), Knowledge Platform, basic Journal, crisis-resource access, and basic Resource Directory search. This is a hard commitment, not a temporary loss-leader strategy — per Section 14.5, paywalling anything crisis-adjacent is treated as an unacceptable trust risk, not just a growth tactic. 

- **Monetized:** premium Journal/evidence features at higher storage tiers or advanced export formatting; paid booking/consultation facilitation fees from the Resource Directory once it matures (Phase 2, Section 16.2) — modeled on a modest facilitation fee rather than a high markup, given the vulnerability of the user base; B2B/B2B2C channel sales (employee assistance programs, following the Wysa precedent directly) where employers fund access for their workforce, which both generates revenue and extends reach to users who might not otherwise find the platform. 

- **Non-revenue but financially material:** CSR partnerships (Indian companies have a statutory CSR spending requirement under Section 135 of the Companies Act, and mental health/social welfare is an eligible category) and grant funding from foundations active in this space (the original document's instinct toward CSR/grants/donations was right — this 

Page 54 of 57 

SAHAY — Master PRD 

Draft v1.0 

section just sequences it: pursue seriously once Phase 1 has real usage data to show, not before, since funders fund traction, not just vision). 

## **17.3 Go-to-Market Sequencing** 

- **Stage 1 — Closed/invite validation (Phase 1 timeframe):** small cohort (tens to low hundreds of users), recruited carefully — not through broad social media advertising given the sensitivity of the topic, but through one or two trusted channels (e.g., a partnership conversation with an existing support organization for warm referrals, professional network outreach) — to validate both demand and, critically, crisis-detection and content-safety performance before any wider exposure. 

- **Stage 2 — Soft public launch (post Phase 1.5):** organic and earned-media-led growth (a credible founder story and an honest, well-sourced piece of content like Section 2's NCRB data correction can be genuinely good PR/SEO material in its own right) rather than paid acquisition, given budget constraints and the importance of attracting users who find the platform through its actual positioning rather than aggressive marketing. 

- **Stage 3 — Institutional partnership push (Phase 2+):** active outreach to potential CSR partners, mental-health-adjacent corporates, and — carefully, with the differentiation from Section 6.3 made explicit upfront — potentially some of the existing NGO ecosystem for referral partnerships (not content partnerships) where individual organizations' on-theground reach could route people toward this platform's digital support layer, without the platform adopting their advocacy framing. 

- **Explicitly avoided at this stage:** broad paid-advertising-led growth, influencer/MRAcommunity-led promotion (which would risk exactly the conflation problem named in Section 6.3 and 14.4), and any growth tactic that treats user acquisition volume as more important than the safety and trust foundations established in Sections 9, 14, and 15. 

Page 55 of 57 

SAHAY — Master PRD 

Draft v1.0 

## **18. Five-to-Ten-Year Vision & Closing Notes** 

## **18.1 Long-Term Goal, Reframed for Credibility** 

The original document's long-term ambitions — AI Companion at scale, a national helpline, a legal network, a therapist network, a research centre, an annual Men's Wellbeing Report, university partnerships, government collaboration, policy advocacy, emergency crisis response — are retained as the long-term direction, with one structural note: each of these should be pursued in the order that builds credibility incrementally, not announced as a simultaneous vision. A research centre and an annual data-driven wellbeing report, in particular, are achievable comparatively early (Year 2–3) and are exactly the kind of credible, citationgrounded output (in the spirit of Section 2.4's NCRB correction) that can differentiate this platform from the existing advocacy ecosystem and open doors to government and university partnership — doing this well, early, may be higher leverage than rushing toward a national helpline, which carries much higher operational and clinical-staffing risk (Section 9.4) before the organization has the infrastructure to do it safely. 

Government collaboration is plausible specifically because the platform's design (Section 2.5) is built to integrate with, not duplicate or compete with, existing government infrastructure like Tele-MANAS — a posture that gives this platform a meaningfully different and more partnership-friendly position than an organization built around criticizing existing law. 

## **18.2 What Success Looks Like at Each Horizon** 

- **1 year:** MVP live with a validated, safe core AI Companion and Journal experience; Tier 1 research gates (7.1) cleared; a small but real and growing user base; at least one credible institutional conversation (CSR or NGO partnership) underway. 

- **3 years:** Full MVP+Phase 2 feature set live and trusted; meaningful B2B or CSR revenue; a published, citable research output establishing the platform as a credible voice; Resource Directory with real verified depth across major Indian cities. 

- **5–10 years:** the institutional vision in Section 5.2 — achieved by having spent years building the credibility, partnerships, and operational maturity that make a national helpline and policy-advocacy role safe and effective to take on, rather than by announcing them early. 

## **18.3 Closing Note on Scope and Next Steps** 

This document fulfills the brief given: a comprehensive PRD spanning problem validation through 5-year vision, built from the original brainstorm with research grounding added throughout and the riskiest components (crisis detection, legal guidance, positioning) treated with the deliberate caution this subject matter requires. It is, by design, a draft pending the Tier 1 reviews specified in Section 7.1 — those reviews are not a formality to schedule after the fact but the actual next step before any user-facing crisis or legal functionality should ship, even in a small pilot. 

Page 56 of 57 

SAHAY — Master PRD 

Draft v1.0 

The most important single idea in this document, if only one survives into the eventual build, is the one established in Section 2.5 and returned to throughout: this platform's job is to be the best possible front door into help that already exists or can be built responsibly — Tele-MANAS, vetted lawyers, real clinicians — not to be a parallel, unaccountable system that tries to do everything itself. That posture is both the safest path and, this PRD argues, the most credible and fundable one. 

Page 57 of 57 

