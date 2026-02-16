const JSON_SCHEMA = {
  type: 'object',
  properties: {
    candidate_name: { type: 'string' },
    headline: { type: 'string', description: 'The subtitle or tagline describing the candidate' },
    companies: { type: 'string', description: 'List of companies mentioned in the hero/header' },
    examples: {
      type: 'array',
      description: 'All STAR examples / case studies on the page',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'The category tag (e.g. Strategic Thinking, Scaling & Growth)' },
          company_and_role: { type: 'string', description: 'Company, role title, and years' },
          title: { type: 'string', description: 'The headline of this example' },
          situation: { type: 'string' },
          task: { type: 'string' },
          action: { type: 'string', description: 'Full action details including all bullet points' },
          result: { type: 'string' },
          key_learning: { type: 'string' },
        },
      },
    },
    metrics: {
      type: 'array',
      description: 'Key metrics displayed on the page',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          label: { type: 'string' },
        },
      },
    },
  },
};

function jsonToMarkdown(data) {
  let md = '';

  if (data.candidate_name) md += `# ${data.candidate_name}\n`;
  if (data.headline) md += `${data.headline}\n`;
  if (data.companies) md += `${data.companies}\n`;
  md += '\n';

  if (data.examples && data.examples.length > 0) {
    md += '## Selected Examples\n\n';
    for (const ex of data.examples) {
      if (ex.title) md += `### ${ex.title}\n`;
      if (ex.category || ex.company_and_role) md += `**${ex.category || ''}** — ${ex.company_and_role || ''}\n\n`;
      if (ex.situation) md += `**Situation:** ${ex.situation}\n\n`;
      if (ex.task) md += `**Task:** ${ex.task}\n\n`;
      if (ex.action) md += `**Action:** ${ex.action}\n\n`;
      if (ex.result) md += `**Result:** ${ex.result}\n\n`;
      if (ex.key_learning) md += `**Key Learning:** ${ex.key_learning}\n\n`;
      md += '---\n\n';
    }
  }

  if (data.metrics && data.metrics.length > 0) {
    md += '## Key Metrics\n\n';
    for (const m of data.metrics) {
      md += `- **${m.value || ''}** — ${m.label || ''}\n`;
    }
    md += '\n';
  }

  return md.trim();
}

export async function onRequestPost(context) {
  try {
    const { url } = await context.request.json();

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'Missing url parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.TABSTACK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Tabstack API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.tabstack.ai/v1/extract/json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, json_schema: JSON_SCHEMA, nocache: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ success: false, error: `Tabstack API error: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const markdown = jsonToMarkdown(data);

    return new Response(JSON.stringify({ success: true, markdown, metadata: {} }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
