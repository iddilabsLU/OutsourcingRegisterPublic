/**
 * CSSF Circular 22/806 Section 4.2.7 Reference Mapping
 *
 * Maps CSSF reference codes (e.g., "54.a", "55.c") to their official regulatory text
 * from CSSF Circular 22/806 Section 4.2.7 - Documentation requirements
 */

export interface CssfReferenceData {
  point: string
  text: string
}

/**
 * Complete mapping of all CSSF references used in the supplier register
 */
export const CSSF_REFERENCES: Record<string, CssfReferenceData> = {
  // Point 53: Status of outsourcing arrangement
  "53": {
    point: "53",
    text: "In-Scope Entities shall maintain an updated register of information on all outsourcing arrangements at individual level and, as applicable, at sub-consolidated and consolidated levels, as set out in point 3, and shall appropriately document all current outsourcing arrangements, distinguishing between the outsourcing of critical or important functions and other outsourcing arrangements. In-Scope Entities shall maintain the documentation of ended outsourcing arrangements within the register and the supporting documentation for an appropriate period in accordance with Luxembourg law."
  },

  // Point 54: Mandatory fields for ALL outsourcing arrangements
  "54.a": {
    point: "54.a",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\na) a reference number for each outsourcing arrangement;"
  },

  "54.b": {
    point: "54.b",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\nb) the start date and, as applicable, the next contract renewal date, the end date and/or notice periods for the service provider and for the In-Scope Entity;"
  },

  "54.c": {
    point: "54.c",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\nc) a brief description of the outsourced function, including the data that are outsourced and whether or not personal data (e.g. by providing a yes or no in a separate data field) have been transferred or if their processing is outsourced to a service provider;"
  },

  "54.d": {
    point: "54.d",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\nd) a category assigned by the In-Scope Entity that reflects the nature of the function as described under point (c) (e.g. ICT, internal control functions), which shall facilitate the identification of different types of arrangements;"
  },

  "54.e": {
    point: "54.e",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\ne) the name of the service provider, the corporate registration number, the legal entity identifier (where available), the registered address and other relevant contact details, and the name of its parent company (if any);"
  },

  "54.f": {
    point: "54.f",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\nf) the country or countries where the service is to be performed, including the location (i.e. country or region) of the data;"
  },

  "54.g": {
    point: "54.g",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\ng) whether or not (yes/no) the outsourced function is considered critical or important, including a brief summary of the reasons why the outsourced function is considered or not as critical or important;"
  },

  "54.h": {
    point: "54.h",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\nh) in the case of outsourcing to a cloud service provider, the cloud service and deployment models (i.e. public/private/hybrid/community) and the specific nature of the data to be held and the locations (i.e. countries or regions) where such data will be stored;"
  },

  "54.i": {
    point: "54.i",
    text: "For the purposes of prudential supervision, the register shall include at least the following information for all existing outsourcing arrangements:\n\ni) the date of the most recent assessment of the criticality or importance of the outsourced function."
  },

  // Point 55: Additional fields for CRITICAL or IMPORTANT functions
  "55.a": {
    point: "55.a",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\na) the In-Scope Entities and other firms within the scope of the prudential consolidation, as applicable, that make use of the outsourcing;"
  },

  "55.b": {
    point: "55.b",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nb) whether or not the service provider or sub-contractor is part of the group or is owned by In-Scope Entities within the group;"
  },

  "55.c": {
    point: "55.c",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nc) the date of the most recent risk assessment and a brief summary of the main results;"
  },

  "55.d": {
    point: "55.d",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nd) the individual or decision-making body (e.g. the management body) in the In-Scope Entity that approved the outsourcing arrangement;"
  },

  "55.e": {
    point: "55.e",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\ne) the governing law of the outsourcing agreement;"
  },

  "55.f": {
    point: "55.f",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nf) the dates of the most recent and next scheduled audits, where applicable;"
  },

  "55.g": {
    point: "55.g",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\ng) where applicable, the names of any sub-contractors to which material parts of a critical or important function are sub-outsourced, including the country where the sub-contractors are registered, where the service will be performed and, if applicable, the location (i.e. country or region) where the data will be stored;"
  },

  "55.h": {
    point: "55.h",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nh) an outcome of the assessment of the service provider's substitutability (as easy, difficult or impossible), the possibility of reintegrating a critical or important function into the In-Scope Entity or the impact of discontinuing the critical or important function;"
  },

  "55.i": {
    point: "55.i",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\ni) identification of alternative service providers in line with point (h);"
  },

  "55.j": {
    point: "55.j",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nj) whether the outsourced critical or important function supports business operations that are time-critical;"
  },

  "55.k": {
    point: "55.k",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nk) the estimated annual budget cost;"
  },

  "55.l": {
    point: "55.l",
    text: "For the outsourcing of critical or important functions, the register shall include the following additional information:\n\nl) the date of the prior notification to the competent authority in accordance with points 59 and 60, as applicable;"
  },
}

/**
 * Helper function to get CSSF reference text by code
 * Returns null if reference not found (graceful degradation)
 */
export function getCssfReference(code: string): CssfReferenceData | null {
  return CSSF_REFERENCES[code] || null
}
