(function () {
    'use strict';

    // ---- DOM refs ----
    var runBtn = document.getElementById('run-btn');
    var btnText = runBtn.querySelector('.btn-text');
    var statusText = document.getElementById('status-text');
    var extractPreview = document.getElementById('extract-preview');
    var extractToggle = document.getElementById('extract-toggle');
    var extractStats = document.getElementById('extract-stats');
    var extractContent = document.getElementById('extract-content');
    var resultsContainer = document.getElementById('results-container');
    var resultsBody = document.getElementById('results-body');
    var streamingCursor = document.getElementById('streaming-cursor');
    var errorContainer = document.getElementById('error-container');
    var errorMessage = document.getElementById('error-message');

    var stepSource = document.getElementById('step-source');
    var stepExtract = document.getElementById('step-extract');
    var stepAnalyze = document.getElementById('step-analyze');

    var state = 'idle'; // idle | extracting | analyzing | complete | error
    var fullMarkdown = '';

    // ---- Pipeline helpers ----
    function setPipeline(step, className) {
        var el = { source: stepSource, extract: stepExtract, analyze: stepAnalyze }[step];
        if (!el) return;
        el.classList.remove('active', 'complete');
        if (className) el.classList.add(className);
    }

    function resetAll() {
        setPipeline('source', null);
        setPipeline('extract', null);
        setPipeline('analyze', null);
        extractPreview.hidden = true;
        extractPreview.classList.remove('open');
        extractToggle.setAttribute('aria-expanded', 'false');
        resultsContainer.hidden = true;
        resultsBody.innerHTML = '';
        streamingCursor.classList.remove('visible');
        errorContainer.hidden = true;
        statusText.textContent = '';
        fullMarkdown = '';
    }

    // ---- Extraction preview toggle ----
    extractToggle.addEventListener('click', function () {
        var isOpen = extractPreview.classList.contains('open');
        extractPreview.classList.toggle('open');
        extractToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // ---- Minimal markdown to HTML ----
    function markdownToHtml(md) {
        var html = md
            // Horizontal rules
            .replace(/^---+$/gm, '<hr>')
            // Headers
            .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
            .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
            .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
            .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
            .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Blockquotes
            .replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
            // Unordered list items
            .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
            // Ordered list items
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Paragraphs: wrap lines that aren't already tags
        var lines = html.split('\n');
        var result = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) {
                result.push('');
            } else if (/^<(h[1-6]|ul|ol|li|blockquote|hr|p)/.test(line)) {
                result.push(line);
            } else {
                result.push('<p>' + line + '</p>');
            }
        }

        return result.join('\n');
    }

    // ---- API: Extract portfolio ----
    function extractPortfolio() {
        return fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://snhertzman.com/portfolio?expand' }),
        })
        .then(function (res) {
            if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Extraction failed'); });
            return res.json();
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.error || 'Extraction failed');
            return data.markdown;
        });
    }

    // ---- API: Analyze candidate (streaming) ----
    function analyzeCandidate(markdown) {
        return fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown: markdown }),
        })
        .then(function (res) {
            if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Analysis failed'); });
            return res;
        })
        .then(function (res) {
            var reader = res.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            function read() {
                return reader.read().then(function (result) {
                    if (result.done) return;

                    buffer += decoder.decode(result.value, { stream: true });
                    var lines = buffer.split('\n');
                    buffer = lines.pop(); // keep incomplete line in buffer

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].trim();
                        if (!line.startsWith('data: ')) continue;
                        var jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            var event = JSON.parse(jsonStr);
                            if (event.type === 'content_block_delta' && event.delta && event.delta.text) {
                                appendText(event.delta.text);
                            }
                        } catch (e) {
                            // skip unparseable lines
                        }
                    }

                    return read();
                });
            }

            return read();
        });
    }

    // ---- Append streamed text ----
    function appendText(text) {
        fullMarkdown += text;
        resultsBody.innerHTML = markdownToHtml(fullMarkdown);
    }

    // ---- Run demo orchestrator ----
    function runDemo() {
        if (state === 'extracting' || state === 'analyzing') return;

        resetAll();
        state = 'extracting';
        runBtn.disabled = true;
        runBtn.classList.add('loading');
        btnText.textContent = 'Running...';
        statusText.textContent = 'Extracting portfolio content via Tabstack...';

        setPipeline('source', 'complete');
        setPipeline('extract', 'active');

        extractPortfolio()
            .then(function (markdown) {
                // Show extraction preview
                setPipeline('extract', 'complete');
                var wordCount = markdown.split(/\s+/).length;
                var sectionCount = (markdown.match(/^#{1,3}\s/gm) || []).length;
                extractStats.textContent = wordCount.toLocaleString() + ' words \u00b7 ' + sectionCount + ' sections';
                extractContent.textContent = markdown.length > 2000 ? markdown.slice(0, 2000) + '\n\n[truncated for preview]' : markdown;
                extractPreview.hidden = false;

                // Start analysis
                state = 'analyzing';
                statusText.textContent = 'Streaming Claude analysis...';
                setPipeline('analyze', 'active');
                resultsContainer.hidden = false;
                streamingCursor.classList.add('visible');

                return analyzeCandidate(markdown);
            })
            .then(function () {
                state = 'complete';
                setPipeline('analyze', 'complete');
                streamingCursor.classList.remove('visible');
                runBtn.disabled = false;
                runBtn.classList.remove('loading');
                btnText.textContent = 'Run Again';
                statusText.textContent = 'Analysis complete.';
            })
            .catch(function (err) {
                state = 'error';
                streamingCursor.classList.remove('visible');
                errorMessage.textContent = err.message || 'Something went wrong. Please try again.';
                errorContainer.hidden = false;
                runBtn.disabled = false;
                runBtn.classList.remove('loading');
                btnText.textContent = 'Try Again';
                statusText.textContent = '';

                // Mark whatever step failed
                if (state === 'extracting' || !fullMarkdown) {
                    setPipeline('extract', null);
                } else {
                    setPipeline('analyze', null);
                }
            });
    }

    // ---- Button handler ----
    runBtn.addEventListener('click', runDemo);

})();
