/**
 * Student ID Card Verification Engine
 * Extracts and validates student name and card expiration/validation date
 * from uploaded Student ID card text/metadata against the entered Fullname.
 */

export interface NameVerificationResult {
  matched: boolean;
  enteredTokens: string[];
  matchedTokens: string[];
  extractedName: string;
  reason?: string;
}

export interface DateVerificationResult {
  valid: boolean;
  expired: boolean;
  parsedDate?: string;
  displayDate?: string;
  reason?: string;
}

export interface StudentIdVerificationEvaluation {
  decision: "approved" | "declined";
  nameCheck: NameVerificationResult;
  dateCheck: DateVerificationResult;
  summary: string;
}

const IGNORED_NAME_WORDS = new Set([
  "mr",
  "mrs",
  "miss",
  "ms",
  "dr",
  "prof",
  "engr",
  "student",
  "name",
  "fullname",
  "surname",
  "firstname",
  "middlename",
  "othername",
  "othernames",
  "card",
  "identity",
  "id",
  "university",
  "college",
  "polytechnic",
  "campus",
  "department",
  "faculty",
  "matric",
  "reg",
  "no",
  "number",
  "level",
  "session",
  "valid",
  "thru",
  "until",
  "expiry",
  "expires",
  "date",
  "holder",
]);

/**
 * Normalizes a name string into comparable lowercase alphabetic tokens.
 */
export function tokenizeName(input: string): string[] {
  if (!input || typeof input !== "string") return [];
  return input
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !IGNORED_NAME_WORDS.has(t));
}

/**
 * Computes Levenshtein edit distance between two short tokens to tolerate
 * minor 1-character OCR recognition noise (e.g. '0'/'o', '1'/'i', 'rn'/'m').
 */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function tokensMatch(enteredToken: string, candidateToken: string): boolean {
  if (enteredToken === candidateToken) return true;
  // Allow 1 character OCR tolerance on tokens of 4+ chars
  if (enteredToken.length >= 4 && candidateToken.length >= 4) {
    return editDistance(enteredToken, candidateToken) <= 1;
  }
  return false;
}

/**
 * Compares the user's entered Fullname against the name/text extracted from the Student ID card.
 */
export function verifyNameAgainstIdCard(
  enteredFullName: string,
  extractedIdNameOrText: string
): NameVerificationResult {
  const enteredTokens = tokenizeName(enteredFullName);
  const extractedTokens = tokenizeName(extractedIdNameOrText);

  if (enteredTokens.length === 0) {
    return {
      matched: false,
      enteredTokens: [],
      matchedTokens: [],
      extractedName: extractedIdNameOrText.trim(),
      reason: "Please enter your full name first.",
    };
  }

  if (extractedTokens.length === 0) {
    return {
      matched: false,
      enteredTokens,
      matchedTokens: [],
      extractedName: "",
      reason: "Could not detect a valid student name on the ID card.",
    };
  }

  const matchedTokens = enteredTokens.filter((entered) =>
    extractedTokens.some((ext) => tokensMatch(entered, ext))
  );

  // Require all tokens to match if 1-2 words, or at least 2 tokens (and >= 60%) for 3+ word names
  const requiredMatches =
    enteredTokens.length <= 2
      ? enteredTokens.length
      : Math.max(2, Math.ceil(enteredTokens.length * 0.6));

  const matched = matchedTokens.length >= requiredMatches;

  return {
    matched,
    enteredTokens,
    matchedTokens,
    extractedName: extractedIdNameOrText.trim(),
    reason: matched
      ? undefined
      : `Name on ID card ("${extractedIdNameOrText.trim()}") does not match the Fullname entered ("${enteredFullName.trim()}").`,
  };
}

/**
 * Validates the Student ID card expiration / validation date.
 * Accepts ISO dates (YYYY-MM-DD), MM/YYYY, DD/MM/YYYY, or academic session years (e.g. 2025/2026).
 */
export function verifyCardValidationDate(
  dateInput: string
): DateVerificationResult {
  const raw = (dateInput || "").trim();
  if (!raw) {
    return {
      valid: false,
      expired: false,
      reason: "Student ID card validation/expiry date is required.",
    };
  }

  let expiryDate: Date | null = null;

  // 1. YYYY-MM-DD (standard date input)
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    expiryDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  // 2. MM/YYYY or MM-YYYY
  if (!expiryDate) {
    const myMatch = raw.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (myMatch) {
      const month = parseInt(myMatch[1], 10);
      const year = parseInt(myMatch[2], 10);
      if (month >= 1 && month <= 12) {
        // Last day of that month
        expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
      }
    }
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY
  if (!expiryDate) {
    const dmyMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      const year = parseInt(dmyMatch[3], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        expiryDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      }
    }
  }

  // 4. Academic session e.g. 2025/2026 or 2025-2026
  if (!expiryDate) {
    const sessionMatch = raw.match(/\b(20\d{2})[\/\-](20\d{2})\b/);
    if (sessionMatch) {
      const endYear = parseInt(sessionMatch[2], 10);
      expiryDate = new Date(endYear, 11, 31, 23, 59, 59, 999);
    }
  }

  // 5. Fallback Date.parse
  if (!expiryDate) {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      expiryDate = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        23,
        59,
        59,
        999
      );
    }
  }

  if (!expiryDate || isNaN(expiryDate.getTime())) {
    return {
      valid: false,
      expired: false,
      reason: `Invalid card validation date format ("${raw}").`,
    };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const isExpired = expiryDate.getTime() < todayStart.getTime();

  const yyyy = expiryDate.getFullYear();
  const mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
  const dd = String(expiryDate.getDate()).padStart(2, "0");
  const isoFormatted = `${yyyy}-${mm}-${dd}`;
  const displayDate = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (isExpired) {
    return {
      valid: false,
      expired: true,
      parsedDate: isoFormatted,
      displayDate,
      reason: `Student ID card expired on ${displayDate}. Please upload a currently valid Student ID card.`,
    };
  }

  return {
    valid: true,
    expired: false,
    parsedDate: isoFormatted,
    displayDate,
  };
}

/**
 * Extracts candidate student name and validation date from raw OCR text of a Student ID card.
 */
export function extractIdFieldsFromOcrText(
  ocrText: string,
  enteredFullName: string
): {
  extractedName: string;
  extractedDate: string;
} {
  if (!ocrText || typeof ocrText !== "string") {
    return { extractedName: "", extractedDate: "" };
  }

  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let extractedName = "";
  let extractedDate = "";

  // 1. Check if the enteredFullName tokens appear across the OCR text
  const enteredTokens = tokenizeName(enteredFullName);
  const allOcrTokens = tokenizeName(ocrText);
  if (enteredTokens.length > 0) {
    const matchedInFullText = enteredTokens.filter((entered) =>
      allOcrTokens.some((ocrTok) => tokensMatch(entered, ocrTok))
    );
    if (matchedInFullText.length >= Math.min(2, enteredTokens.length)) {
      // Find the best matching line or reconstruct from matched tokens
      const bestLine = lines.find((line) => {
        const lineTokens = tokenizeName(line);
        return enteredTokens.some((e) => lineTokens.some((lt) => tokensMatch(e, lt)));
      });
      extractedName = bestLine
        ? bestLine.replace(/^(full\s*name|student\s*name|name|surname)\s*[:\-]?\s*/i, "").trim()
        : enteredFullName.trim();
    }
  }

  // 2. If not found via enteredFullName, look for explicit "Name:" label in OCR lines
  if (!extractedName) {
    for (let i = 0; i < lines.length; i++) {
      const nameLabelMatch = lines[i].match(
        /(?:full\s*name|student\s*name|surname|name)\s*[:\-]\s*([A-Za-z\s.\-]{3,})/i
      );
      if (nameLabelMatch && nameLabelMatch[1]) {
        extractedName = nameLabelMatch[1].trim();
        break;
      }
    }
  }

  // 3. Look for expiration / validation date patterns in OCR text
  // Check YYYY-MM-DD
  const isoDateMatch = ocrText.match(/\b(20[2-3]\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoDateMatch) {
    extractedDate = isoDateMatch[0];
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  if (!extractedDate) {
    const dmyMatch = ocrText.match(/\b(0?[1-9]|[12]\d|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](20[2-3]\d)\b/);
    if (dmyMatch) {
      const dd = dmyMatch[1].padStart(2, "0");
      const mm = dmyMatch[2].padStart(2, "0");
      const yyyy = dmyMatch[3];
      extractedDate = `${yyyy}-${mm}-${dd}`;
    }
  }

  // Check MM/YYYY
  if (!extractedDate) {
    const myMatch = ocrText.match(/\b(0?[1-9]|1[0-2])[\/\-](20[2-3]\d)\b/);
    if (myMatch) {
      const month = parseInt(myMatch[1], 10);
      const year = parseInt(myMatch[2], 10);
      const lastDay = new Date(year, month, 0).getDate();
      extractedDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    }
  }

  // Check Academic Session e.g. 2025/2026
  if (!extractedDate) {
    const sessionMatch = ocrText.match(/\b(20[2-3]\d)[\/\-](20[2-3]\d)\b/);
    if (sessionMatch) {
      const endYear = parseInt(sessionMatch[2], 10);
      extractedDate = `${endYear}-12-31`;
    }
  }

  return { extractedName, extractedDate };
}

/**
 * Evaluates both the extracted ID card name against the entered Fullname
 * and the card validation date to return an Approve or Decline decision.
 */
export function evaluateStudentIdVerification(params: {
  enteredFullName: string;
  extractedIdName: string;
  cardValidationDate: string;
}): StudentIdVerificationEvaluation {
  const nameCheck = verifyNameAgainstIdCard(
    params.enteredFullName,
    params.extractedIdName
  );
  const dateCheck = verifyCardValidationDate(params.cardValidationDate);

  if (nameCheck.matched && dateCheck.valid) {
    return {
      decision: "approved",
      nameCheck,
      dateCheck,
      summary: `Approved: ID card name matches "${params.enteredFullName.trim()}" and card is valid through ${dateCheck.displayDate}.`,
    };
  }

  const reasons: string[] = [];
  if (!nameCheck.matched && nameCheck.reason) {
    reasons.push(nameCheck.reason);
  }
  if (!dateCheck.valid && dateCheck.reason) {
    reasons.push(dateCheck.reason);
  }

  return {
    decision: "declined",
    nameCheck,
    dateCheck,
    summary: reasons.join(" ") || "Student ID verification declined.",
  };
}
