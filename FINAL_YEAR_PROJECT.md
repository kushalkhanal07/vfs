# Final Year Project — Detection Modules

This document summarizes three core modules implemented in the project: CSP Detection, Shield Detection, and Spam Detection. Each module includes a concise overview and a short illustrative code snippet.

---

## CSP Detection

Overview
- Monitors HTTP responses and client reports to detect Content Security Policy (CSP) violations and misconfigurations.
- Uses header inspection, report endpoints, and pattern matching to identify attempted policy bypass or inline-script injections.
- Logs structured incidents and raises alerts for high-severity violations.

Algorithm (concise)
- Parse `Content-Security-Policy` headers on every response; extract directives and source lists.
- Maintain a whitelist of trusted origins and known-safe directives; compute a policy strength score.
- Accept and validate JSON CSP reports at a `/csp-report` endpoint; deduplicate by hash and origin.
- Correlate client reports with response-time events and recent deploys to reduce false positives.
- Classify incidents by severity (info/warn/critical) and escalate when violations target protected resources.

Code (Node.js middleware + report handler)
```javascript
export function computeCspaScore(candidateNote, existingNotes = []) {
  let bestMatch = null;

  for (const existingNote of existingNotes) {
    if (!existingNote || existingNote.deleted) continue;

    const comparison = compareNotes(candidateNote, existingNote);

    if (!bestMatch || comparison.score > bestMatch.score) {
      bestMatch = summarizeMatch(candidateNote, existingNote, comparison);
    }
  }

  const score = bestMatch?.score ?? 0;

  return {
    score,
    isDuplicate: score >= 0.8,
    isRelated: score >= 0.45 && score < 0.8,
    bestMatch,
    message: score >= 0.8
      ? "You may have duplicate notes."
      : score >= 0.45
        ? "This note looks related to an existing note."
        : "No strong match found.",
  };
}
function parseCsp(header){ return (header||'').split(';').map(s=>s.trim()); }
app.use((req,res,next)=>{
  const csp = res.getHeader('content-security-policy') || '';
  const directives = parseCsp(csp);
  if (!csp || /unsafe-inline|unsafe-eval/.test(csp)) {
    logIncident({ path: req.path, issue: 'weak-csp', directives });
  }
  next();
});
app.post('/csp-report', express.json(), (req,res)=>{ storeReport(req.body); res.sendStatus(204); });
```

---

## Shield Detection

Overview
- Identifies attempts to hide malicious payloads or evade safeguards ("shields") in uploads and requests.
- Combines heuristic checks (entropy, suspicious file headers) with lightweight ML/thresholding for anomaly scoring.
- Flags or quarantines items exceeding configured risk thresholds.

Algorithm (concise)
- Extract file metadata (filename, extension, size) and read the first N bytes to determine magic headers.
- Compute statistical features: byte-level entropy, compression ratio, and uncommon opcode patterns.
- Cross-check extension vs magic header mismatches and known signature DBs (whitelist/blacklist).
- Combine heuristic features into a risk score; apply ensemble thresholding with a lightweight model if available.
- Actions: pass, quarantine, or sandbox-run (with strict resource limits) depending on score and context.

Code (composite heuristic detector)
```javascript
function detectShield(item){
  const magic = sniffMagic(item.buffer.slice(0,64));
  const entropy = calcEntropy(item.buffer);
  const extMismatch = !matchesExtension(magic, item.filename);
  const sigMatch = signatureDB.lookup(item.buffer);
  const score = Math.min(1, (entropy>7.2?0.5:0) + (extMismatch?0.3:0) + (sigMatch?0.8:0));
  if (score >= 0.8) return quarantine(item.id,'shield-high');
  if (score >= 0.5) return sandbox(item.id);
  return 'ok';
}
```

---

## Spam Detection

Overview
- Scores text and metadata to detect spammy content in messages, comments, and uploads.
- Uses keyword heuristics, rate-limits, and simple Bayesian/ML scoring to reduce false positives.
- Integrates with moderation workflow to auto-hide or queue items for review.

Algorithm (concise)
- Normalize text (lowercase, strip punctuation) and extract tokens, URLs, and contact markers.
- Compute feature vector: keyword hits, URL-to-word ratio, token repetition, message length, and sender history.
- Apply lightweight classifier (Naive Bayes or logistic regression) trained on curated examples; fallback to heuristics.
- Enforce temporal rate limits and reputation thresholds; take automated actions when confidence > configured cutoff.
- Log decisions and surface borderline items to moderators with highlighted evidence.

Code (scoring + action)
```javascript
const keywords = ['free','click','buy now','subscribe'];
function isSpam(msg){
  const t = msg.text.toLowerCase();
  const hits = keywords.reduce((n,k)=> n + (t.includes(k)?1:0), 0);
  const urlRatio = (t.match(/https?:\/\//g)||[]).length / Math.max(1, t.split(' ').length);
  const score = hits*0.6 + Math.min(1,urlRatio)*0.5 + (reputationPenalty(msg.senderId)||0);
  if (score > 0.7) return { action:'hide', reason:'high-score', score };
  if (score > 0.4) return { action:'queue', reason:'moderate-score', score };
  return { action:'accept', score };
}
```

---

Contact: Project deliverables include implementations, tests, and documentation for each module on request.
