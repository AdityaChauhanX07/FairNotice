import type {
  ActionPlan,
  DocumentAnalysis,
  DocumentExplanation,
  DocumentExtraction,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Results payload                                                    */
/* ------------------------------------------------------------------ */

/**
 * The complete analysis bundle the Results Dashboard renders. The
 * upload→results flow will stash this object in `sessionStorage` under
 * {@link RESULTS_STORAGE_KEY}; until then the page falls back to the mock
 * dataset below so the dashboard is always demoable.
 */
export interface ResultsPayload {
  extraction: DocumentExtraction;
  analysis: DocumentAnalysis;
  explanation: DocumentExplanation;
  actionPlan: ActionPlan;
  meta: {
    /** Total end-to-end processing time, in seconds. */
    processingTime: number;
    /** Number of statutes cited across the analysis. */
    statutesReferenced: number;
    model: string;
  };
}

/** `sessionStorage` key shared by the upload flow and the results page. */
export const RESULTS_STORAGE_KEY = "steminate:results";

/* ------------------------------------------------------------------ */
/* Mock scenario — California 3-day notice to pay rent or quit         */
/* ------------------------------------------------------------------ */

const mockExtraction: DocumentExtraction = {
  document_type: "eviction_notice",
  sender: {
    name: "Robert Hensley",
    role: "Property Manager",
    organization: "Sunset Ridge Property Management, LLC",
  },
  recipient: {
    name: "Maria Gonzalez",
  },
  date_issued: "2026-06-01",
  jurisdiction: {
    state: "California",
    city: "Los Angeles",
    county: "Los Angeles",
  },
  claims: [
    {
      id: 1,
      claim:
        "You owe $2,400.00 in unpaid rent for the months of April 2026 and May 2026.",
      legal_basis_cited: "California Code of Civil Procedure §1161",
    },
    {
      id: 2,
      claim:
        "You must pay the full balance due or vacate and surrender the premises within THREE (3) DAYS of service of this notice.",
      legal_basis_cited: "California Code of Civil Procedure §1161",
    },
    {
      id: 3,
      claim:
        "A late fee of $150.00 and a $35.00 returned-check charge have been added to your balance and are due with the rent.",
      legal_basis_cited: null,
    },
    {
      id: 4,
      claim:
        "You are further in violation of your lease for keeping an unauthorized pet (one dog) in the unit.",
      legal_basis_cited: null,
    },
    {
      id: 5,
      claim:
        "If you fail to comply, legal proceedings (unlawful detainer) will be initiated to recover possession of the premises, plus rents, costs, and attorney's fees.",
      legal_basis_cited: null,
    },
  ],
  deadlines: [
    {
      date: "2026-06-04",
      days_from_notice: 3,
      action_required:
        "Pay $2,585.00 in full or move out and surrender the premises",
      consequence:
        "Landlord may file an unlawful detainer (eviction) lawsuit in court",
    },
  ],
  dollar_amounts: [
    { amount: 2400, context: "Unpaid rent for April and May 2026" },
    { amount: 150, context: "Late fee added to the balance" },
    { amount: 35, context: "Returned-check charge" },
  ],
  legal_references: [
    {
      reference: "California Code of Civil Procedure §1161",
      context: "Cited as the basis for the 3-day notice to pay rent or quit",
    },
  ],
  key_demands: [
    "Pay $2,585.00 within 3 days",
    "Remove the unauthorized pet",
    "Vacate the premises if the balance is not paid",
  ],
  urgency_level: "critical",
  raw_text_length: 1840,
};

const mockAnalysis: DocumentAnalysis = {
  overall_assessment:
    "This is a 3-day notice to pay rent or quit — the first step a landlord must take before they can sue to evict you. It is urgent, but it is NOT a court order and it does not mean you have to leave in 3 days. Several parts of this notice appear legally defective: it demands late fees and a returned-check charge alongside rent (which can invalidate a pay-or-quit notice), it may have miscounted the 3 days, and it improperly combines a rent demand with a separate lease violation. You very likely have strong defenses and time to act.",
  urgency: "critical",
  claim_analysis: [
    {
      claim_id: 1,
      original_claim:
        "You owe $2,400.00 in unpaid rent for the months of April 2026 and May 2026.",
      analysis:
        "A landlord can demand unpaid rent, but a valid 3-day notice must state the exact amount of rent due and the name, address, and phone number of the person to whom it must be paid. Just as important: if your unit has serious habitability problems that a government inspector has cited and the landlord hasn't fixed within 35 days, the landlord may not be legally allowed to collect this rent at all. If you reported the broken heater, that may be a defense to the amount owed.",
      legal_status: "requires_review",
      relevant_statutes: [
        {
          statute_id: "ccp-1161",
          statute_number: "California Code of Civil Procedure §1161",
          relevance:
            "A 3-day pay-or-quit notice must state the precise rent amount due and the name, address, and telephone number of the person to whom rent is to be paid. Missing or inaccurate details make the notice defective.",
          supports_claim: true,
        },
        {
          statute_id: "ca-civ-1942.4",
          statute_number: "California Civil Code §1942.4",
          relevance:
            "If the dwelling has been officially cited as substandard and uncorrected for 35+ days, the landlord may not demand or collect rent or serve a pay-or-quit notice — which could void this demand entirely.",
          supports_claim: false,
        },
      ],
      user_action:
        "Gather your rent receipts and bank records to confirm the exact amount actually owed, and write down the dates of any repair problems you reported and to whom.",
    },
    {
      claim_id: 2,
      original_claim:
        "You must pay the full balance due or vacate and surrender the premises within THREE (3) DAYS of service of this notice.",
      analysis:
        "The 3-day deadline does NOT count Saturdays, Sundays, or court holidays. This notice was served June 1 and demands payment by June 4, which appears to count a Saturday and Sunday in the window. If the days were miscounted, the notice is defective and cannot support an eviction. Even after 3 valid days pass, you do not have to move — the landlord would still have to sue you and win in court first.",
      legal_status: "potentially_invalid",
      relevant_statutes: [
        {
          statute_id: "ccp-1161",
          statute_number: "California Code of Civil Procedure §1161",
          relevance:
            "For a 3-day notice to pay rent or quit, the three days are counted excluding Saturdays, Sundays, and judicial holidays. A miscounted deadline renders the notice invalid.",
          supports_claim: false,
        },
      ],
      user_action:
        "Mark a calendar excluding weekends and holidays to confirm your real deadline, and do not move out based on the date printed in the notice alone.",
    },
    {
      claim_id: 3,
      original_claim:
        "A late fee of $150.00 and a $35.00 returned-check charge have been added to your balance and are due with the rent.",
      analysis:
        "A 3-day notice to pay rent or quit can only demand past-due rent — not late fees, returned-check charges, or other costs. By bundling $185 in fees into the amount you must pay to stay, this notice overstates what is legally due, which on its own can make the entire notice defective and unenforceable.",
      legal_status: "potentially_invalid",
      relevant_statutes: [
        {
          statute_id: "ccp-1161",
          statute_number: "California Code of Civil Procedure §1161",
          relevance:
            "Only rent may be demanded in a 3-day pay-or-quit notice. Including late fees or other charges overstates the amount due and is a common ground for dismissing an eviction.",
          supports_claim: false,
        },
      ],
      user_action:
        "Note that you are only required to consider the $2,400 in rent — not the $185 in extra fees — when evaluating this notice.",
    },
    {
      claim_id: 4,
      original_claim:
        "You are further in violation of your lease for keeping an unauthorized pet (one dog) in the unit.",
      analysis:
        "Because you have lived here more than 12 months, the landlord generally needs 'just cause' to end your tenancy, and a curable lease violation like an unauthorized pet first requires a separate 3-day notice to CURE (fix) or quit — giving you the chance to correct it. Combining a curable lease violation with a pay-or-quit demand in a single notice is improper and weakens the landlord's position.",
      legal_status: "requires_review",
      relevant_statutes: [
        {
          statute_id: "ca-civ-1946.2",
          statute_number: "California Civil Code §1946.2",
          relevance:
            "After 12 months of tenancy, eviction requires just cause, and curable at-fault violations require a notice and an opportunity to cure before the tenancy can be terminated.",
          supports_claim: false,
        },
      ],
      user_action:
        "If the pet can be removed or you can seek the landlord's written permission, document your effort to cure the issue in case it is raised later.",
    },
    {
      claim_id: 5,
      original_claim:
        "If you fail to comply, legal proceedings (unlawful detainer) will be initiated to recover possession of the premises, plus rents, costs, and attorney's fees.",
      analysis:
        "This describes the normal eviction process and is generally accurate — but it is a threat of a future lawsuit, not the lawsuit itself. The landlord cannot remove you, change the locks, or take your belongings. Only a sheriff, acting on a court-issued writ of possession after the landlord wins in court, can physically remove you. If you are later served with court papers (a summons), you will have just 5 court days to file a response.",
      legal_status: "standard_procedure",
      relevant_statutes: [
        {
          statute_id: "ccp-1174",
          statute_number: "California Code of Civil Procedure §1174",
          relevance:
            "A tenant may only be removed by the sheriff under a court-issued writ of possession after the landlord wins an unlawful detainer case — never directly by the landlord.",
          supports_claim: true,
        },
        {
          statute_id: "ccp-1167",
          statute_number: "California Code of Civil Procedure §1167",
          relevance:
            "Once served with an unlawful detainer summons, the tenant has only 5 court days (excluding weekends and holidays) to file a written response or risk losing by default.",
          supports_claim: true,
        },
      ],
      user_action:
        "If you receive court papers, do not ignore them — file a written response within 5 court days to preserve your right to a trial.",
    },
  ],
  deadline_analysis: [
    {
      deadline: "2026-06-04 (3 days from notice)",
      action_required:
        "Pay the rent owed or respond — do not simply move out on this date",
      is_legally_compliant: false,
      statute_basis: "California Code of Civil Procedure §1161",
      recommendation:
        "The 3-day count excludes weekends and holidays, so the deadline printed here is likely too early. Treat it as a signal to act quickly — by paying the rent owed or getting advice — not as a move-out date.",
    },
  ],
  rights_summary: [
    "You have lived in your home for more than 12 months, so your landlord generally needs a legally valid 'just cause' to evict you (California Civil Code §1946.2).",
    "You have the right to pay the rent owed within the notice period and stop the eviction entirely (California Code of Civil Procedure §1161).",
    "Your landlord cannot legally collect rent for a unit that has been officially cited as substandard and left unrepaired for 35+ days (California Civil Code §1942.4).",
    "Your landlord cannot retaliate against you for reporting habitability problems within the prior 180 days (California Civil Code §1942.5).",
    "Only a sheriff, acting on a court order, can remove you — your landlord cannot lock you out, shut off utilities, or remove your belongings (California Code of Civil Procedure §1174).",
    "If you are sued, you have the right to file a response and have your day in court before any eviction (California Code of Civil Procedure §1167).",
  ],
  // Three red flags keeps the demo scenario at "medium" confidence: a fourth
  // would trip the ">3 red flags" deduction in calculateConfidence and push the
  // score into "low". The attorney's-fees concern is folded into claim 5's
  // analysis instead.
  red_flags: [
    "The notice demands $150 in late fees and a $35 returned-check charge on top of rent — a 3-day pay-or-quit notice may only demand rent, so this overstatement can make the entire notice defective.",
    "The 3-day deadline (June 1 → June 4) appears to count a Saturday and Sunday, but those days must be excluded — suggesting the deadline was miscounted.",
    "A curable lease violation (the pet) is bundled into a pay-or-quit notice instead of being handled with a separate notice to cure, which is procedurally improper.",
  ],
  referral_needed: true,
  referral_reason:
    "An eviction proceeding puts your housing at risk and involves strict court deadlines. While this notice has several apparent defects you can raise, a local legal aid attorney or tenants' rights organization should review your specific lease and facts before you respond.",
};

const mockExplanation: DocumentExplanation = {
  document_summary:
    "You received a 3-day notice to pay rent or quit from your property manager. It says you owe $2,400 in rent (plus $185 in fees) and gives you a short window to either pay or move out. This is the required first step before a landlord can try to evict you in court — but it is not a court order, and it does not mean you must leave in 3 days. Several parts of it appear to break the rules landlords must follow.",
  sections: [
    {
      heading: "What a '3-day notice' actually is",
      content:
        "A 3-day notice to pay rent or quit is a formal warning, not an eviction. It is the landlord saying 'pay what's owed or I may take you to court.' You cannot be forced out of your home without the landlord first winning an eviction lawsuit and a sheriff carrying out a court order. The 3 days are also counted without weekends or holidays.",
      statute_references: [
        "California Code of Civil Procedure §1161",
        "California Code of Civil Procedure §1174",
      ],
    },
    {
      heading: "Why this notice may not hold up",
      content:
        "A pay-or-quit notice can only demand rent. This one adds late fees and a returned-check charge, appears to miscount the 3 days, and mixes in a separate complaint about a pet. Each of these is a recognized reason a court can throw out an eviction case.",
      statute_references: ["California Code of Civil Procedure §1161"],
    },
    {
      heading: "The protections you keep",
      content:
        "Because you've lived here over a year, you have just-cause protections. If you reported repairs, you're protected from retaliation, and your landlord can't collect rent on a home that's been officially cited as substandard and left unfixed.",
      statute_references: [
        "California Civil Code §1946.2",
        "California Civil Code §1942.5",
        "California Civil Code §1942.4",
      ],
    },
  ],
  key_terms: [
    {
      term: "3-Day Notice to Pay Rent or Quit",
      definition:
        "A written warning a landlord must give before suing to evict for unpaid rent. It demands that you pay the overdue rent or move out within three days (not counting weekends or holidays). It is not an eviction by itself.",
    },
    {
      term: "Unlawful Detainer",
      definition:
        "The legal name for an eviction lawsuit in California. A landlord must win this case in court before you can be made to leave.",
    },
    {
      term: "Just Cause",
      definition:
        "A legally valid reason to end a tenancy. After you've lived somewhere 12+ months, a California landlord generally must have just cause — and state it in writing — to evict you.",
    },
    {
      term: "Warranty of Habitability",
      definition:
        "Your landlord's legal duty to keep your home livable — with working plumbing, heat, hot water, electricity, and a safe, sanitary condition. Serious unaddressed problems can be a defense against owed rent.",
    },
    {
      term: "Notice to Cure or Quit",
      definition:
        "A separate kind of notice used for fixable lease violations (like an unauthorized pet). It must give you a chance to correct the problem before the tenancy can be ended.",
    },
    {
      term: "Writ of Possession",
      definition:
        "The court order that authorizes the sheriff to remove a tenant after the landlord wins an eviction case. Only the sheriff — never the landlord — can carry it out.",
    },
    {
      term: "Default Judgment",
      definition:
        "An automatic loss that happens if you are served with court papers and don't respond in time. In an eviction, you have only 5 court days to file your response.",
    },
  ],
  what_this_means_for_you:
    "You have time and options. You do not have to move out in 3 days, and you should not move out based solely on the date in this notice. Your most reliable way to stay is to pay the actual rent owed within the valid notice period, but you also appear to have strong grounds to challenge this notice if the landlord takes it to court. Act quickly, keep copies of everything, and get free advice from a local tenants' rights group.",
  emotional_reassurance:
    "Receiving an eviction notice is frightening, but take a breath — this is a process with clear rules, and those rules protect you too. Most tenants in your situation have more time and more rights than the notice makes it feel like. You are not being evicted today, and you don't have to face this alone.",
};

const mockActionPlan: ActionPlan = {
  timeline: [
    {
      date: "2026-06-04",
      days_remaining: 3,
      urgency: "critical",
      action: "Decide how to respond to the 3-day notice",
      detail:
        "Within the notice window, either pay the rent actually owed (to stop the eviction) or get advice and prepare to challenge the notice. Do not move out based on this date alone.",
      statute_basis: "California Code of Civil Procedure §1161",
    },
    {
      date: null,
      days_remaining: 5,
      urgency: "high",
      action: "Respond to any court summons within 5 court days",
      detail:
        "If the landlord files an unlawful detainer and you are served, you must file a written response within 5 court days (excluding weekends and holidays) or risk losing by default.",
      statute_basis: "California Code of Civil Procedure §1167",
    },
    {
      date: null,
      days_remaining: 15,
      urgency: "medium",
      action: "Contact a local legal aid or tenants' rights organization",
      detail:
        "Have an attorney review your lease and the notice's defects before any court date. Many tenant services are free and can represent you.",
      statute_basis: null,
    },
    {
      date: null,
      days_remaining: 30,
      urgency: "low",
      action: "Document habitability issues and repair requests",
      detail:
        "Photograph any disrepair and gather written records of repairs you reported. These support both a habitability defense and a retaliation defense.",
      statute_basis: "California Civil Code §1942.5",
    },
  ],
  options: [
    {
      id: 1,
      title: "Pay the rent actually owed within the notice period",
      description:
        "Paying the $2,400 in genuine rent (you are not required to pay the $185 in disputed fees) within the valid notice window stops the eviction in its tracks and is your most certain way to keep your home.",
      likelihood_of_success: "high",
      statute_basis: "California Code of Civil Procedure §1161",
      recommended: true,
    },
    {
      id: 2,
      title: "Challenge the notice as defective",
      description:
        "Because the notice demands illegal fees, appears to miscount the 3 days, and improperly mixes in a lease violation, you can raise these as defenses if the landlord files in court — potentially getting the case dismissed.",
      likelihood_of_success: "medium",
      statute_basis: "California Code of Civil Procedure §1161",
      recommended: true,
    },
    {
      id: 3,
      title: "Raise a habitability or retaliation defense",
      description:
        "If you reported repairs that went unfixed, the landlord may be barred from collecting this rent or from retaliating against you. This can reduce or eliminate what you owe.",
      likelihood_of_success: "medium",
      statute_basis: "California Civil Code §1942.4",
      recommended: false,
    },
    {
      id: 4,
      title: "Negotiate a written payment plan",
      description:
        "Propose a realistic repayment schedule in writing. Many landlords prefer a guaranteed plan over the cost and delay of an eviction lawsuit. Get any agreement in writing before paying.",
      likelihood_of_success: "medium",
      statute_basis: null,
      recommended: false,
    },
  ],
  response_letter: {
    to: "Robert Hensley, Property Manager — Sunset Ridge Property Management, LLC",
    from: "Maria Gonzalez",
    date: "2026-06-03",
    subject:
      "Response to 3-Day Notice to Pay Rent or Quit dated June 1, 2026",
    body: "Dear Mr. Hensley,\n\nI am writing in response to the 3-Day Notice to Pay Rent or Quit I received, dated June 1, 2026, regarding the unit I rent at the above address.\n\nI take my tenancy seriously and want to resolve the rent that is genuinely owed. However, I must note several concerns with the notice as written.\n\nFirst, under California Code of Civil Procedure §1161, a 3-day notice to pay rent or quit may demand only past-due rent. The notice improperly includes a $150 late fee and a $35 returned-check charge in the amount due. I am prepared to address the rent itself, but these additional charges cannot lawfully be required as a condition of curing the notice.\n\nSecond, the three-day period must be counted excluding Saturdays, Sundays, and judicial holidays. The deadline stated in the notice does not appear to account for the intervening weekend.\n\nThird, the notice references an alleged lease violation regarding a pet. Under California Civil Code §1946.2, a curable lease violation requires a separate notice and an opportunity to cure, and cannot be combined with a rent demand in this manner.\n\nI ask that you provide a corrected statement reflecting only the rent lawfully due so that I can promptly resolve this matter. I would also welcome the opportunity to arrange a written payment plan. Please consider this letter a good-faith effort to cure and to keep my tenancy in good standing.\n\nI am also reviewing outstanding repair issues I have previously reported, which may bear on the amount owed under California Civil Code §1942.4.",
    closing:
      "Thank you for your attention to these matters. I look forward to your written response.\n\nSincerely,\nMaria Gonzalez",
  },
  resources: [
    {
      name: "Stay Housed LA",
      description:
        "Los Angeles County partnership offering free legal help, eviction defense, and rent-relief connections for tenants facing eviction.",
      type: "legal_aid",
      contact: "stayhousedla.org • (888) 694-0040",
      jurisdiction_specific: true,
    },
    {
      name: "Legal Aid Foundation of Los Angeles (LAFLA)",
      description:
        "Free civil legal services for low-income residents, including tenant eviction defense and habitability claims.",
      type: "legal_aid",
      contact: "lafla.org • (800) 399-4529",
      jurisdiction_specific: true,
    },
    {
      name: "California Courts Self-Help — Eviction",
      description:
        "Official state guide with step-by-step instructions and forms for responding to an eviction (unlawful detainer) lawsuit.",
      type: "government",
      contact: "selfhelp.courts.ca.gov/eviction",
      jurisdiction_specific: true,
    },
    {
      name: "Tenants Together",
      description:
        "Statewide nonprofit tenants' rights organization with a renters' rights hotline and know-your-rights resources.",
      type: "nonprofit",
      contact: "tenantstogether.org • (888) 495-8020",
      jurisdiction_specific: true,
    },
    {
      name: "211 LA",
      description:
        "Free, confidential 24/7 hotline that connects residents with rent assistance, housing, and emergency support services.",
      type: "hotline",
      contact: "Dial 211 • 211la.org",
      jurisdiction_specific: false,
    },
  ],
};

/** The complete mock results bundle used as a development/demo fallback. */
export const mockResults: ResultsPayload = {
  extraction: mockExtraction,
  analysis: mockAnalysis,
  explanation: mockExplanation,
  actionPlan: mockActionPlan,
  meta: {
    processingTime: 7.4,
    statutesReferenced: 8,
    model: "llama-3.3-70b-versatile",
  },
};
