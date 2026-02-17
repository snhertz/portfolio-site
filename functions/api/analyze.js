const SYSTEM_PROMPT = 'You are an expert recruiter and talent evaluator. Analyze candidates\' backgrounds against job requirements with specific evidence. Reference concrete roles, metrics, and experiences from the candidate\'s portfolio. Be direct about strengths and gaps. Format in clean markdown.';

export async function onRequestPost(context) {
  try {
    const { markdown, jobMarkdown } = await context.request.json();

    if (!markdown) {
      return new Response(JSON.stringify({ error: 'Missing markdown parameter (candidate portfolio)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!jobMarkdown) {
      return new Response(JSON.stringify({ error: 'Missing jobMarkdown parameter (job description)' }), {
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

    const userPrompt = `Analyze how well this candidate fits the role below. Use only the content provided.

## Job Description (extracted via Tabstack)
${jobMarkdown}

## Candidate Portfolio (extracted via Tabstack)
${markdown}

## Provide your analysis with these sections:
1. **Overall Fit** — Score (out of 10) + one-sentence summary
2. **Strongest Signals** — 3-4 specific experiences from the portfolio that map directly to this role's requirements
3. **Execution Evidence** — Concrete examples of doing the work (not just managing it)
4. **Domain & Technical Fit** — How the candidate's background maps to the role's industry, technical, or domain requirements
5. **Potential Gaps** — Be honest about where the candidate falls short
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
