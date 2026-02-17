const JOB_DESCRIPTION = `## Company: Mozilla — Tabstack (New Products)
Mozilla (225M+ monthly users, non-profit backed) is building Tabstack — a browser automation stack for AI agents. Goal: make it simple for developers to integrate fast, reliable web interactions into AI-powered systems and agentic applications. Stage: 0→1, operating as a fast-paced autonomous team within Mozilla's New Products org.

## Role: Founding GTM Lead

### Core Responsibilities

**40% — Customer Acquisition & GTM Experiments**
- Targeted outreach to AI startups, DevTools companies, early adopters
- Ecosystem engagement (LangChain community, AI Discord servers, HN, Reddit)
- Founder-led sales (you ARE the sales team right now)
- Test messaging, channels, offers

**30% — Messaging, Positioning & Technical Content**
- Craft the "why Tabstack?" narrative
- Write blogs, use cases, integration guides
- Build landing pages that convert developers
- Experiment with different angles (speed? reliability? simplicity?)

**20% — Commercial Validation**
- Close first paying customers or committed design partners
- Negotiate contracts, pricing experiments
- Prove commercial viability

**10% — Product Feedback Loops**
- Translate customer objections into eng priorities
- Surface friction points from trials/demos
- Shape roadmap based on user signal

### Ideal Candidate Profile
- Has done 0→1 GTM before (not just optimized existing funnels)
- Technical enough to speak to AI engineers and evaluate product decisions
- Hands-on executor who builds landing pages, writes copy, runs outreach themselves
- Comfortable with ambiguity, autonomy, and scrappy resource constraints
- Founder experience or founder-like mentality

### 90-Day Success Criteria
- Weeks 1-4: Talk to 20+ potential users, identify 3-5 GTM experiment hypotheses
- Weeks 5-8: Launch 2-3 scrappy GTM tests, generate first MQLs/PQLs, start drafting messaging framework
- Weeks 9-12: Close first design partner or paid pilot, prove a repeatable acquisition motion, feed structured product feedback to eng team`;

const SYSTEM_PROMPT = 'You are an expert recruiter and talent evaluator. Analyze candidates\' backgrounds against job requirements with specific evidence. Reference concrete roles, metrics, and experiences. Be direct about strengths and gaps. Format in clean markdown.';

export async function onRequestPost(context) {
  try {
    const { markdown } = await context.request.json();

    if (!markdown) {
      return new Response(JSON.stringify({ error: 'Missing markdown parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Anthropic API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `Analyze how well this candidate fits the role below. Use only the portfolio content provided.

${JOB_DESCRIPTION}

## Candidate Portfolio (extracted via Tabstack)
${markdown}

## Provide your analysis with these sections:
1. **Overall Fit** — Score (out of 10) + one-sentence summary
2. **Strongest Signals** — 3-4 specific experiences that map to this role
3. **GTM Execution Evidence** — Concrete examples of doing the work (not managing it)
4. **Technical & Product Affinity** — How their background maps to developer tools / AI / technical audiences
5. **Potential Gaps** — Be honest. This builds credibility.
6. **Bottom Line** — 2-3 sentence recommendation`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Claude API error: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
