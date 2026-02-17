(function () {
    'use strict';

    // ---- DOM refs ----
    var portfolioInput = document.getElementById('portfolio-url');
    var jobInput = document.getElementById('job-url');
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

    var descPortfolio = document.getElementById('desc-portfolio');
    var descJob = document.getElementById('desc-job');

    var stepPortfolio = document.getElementById('step-portfolio');
    var stepJob = document.getElementById('step-job');
    var stepAnalyze = document.getElementById('step-analyze');

    var state = 'idle';
    var fullMarkdown = '';

    // ---- Pipeline helpers ----
    function setPipeline(step, className) {
        var el = { portfolio: stepPortfolio, job: stepJob, analyze: stepAnalyze }[step];
        if (!el) return;
        el.classList.remove('active', 'complete');
        if (className) el.classList.add(className);
    }

    function resetAll() {
        setPipeline('portfolio', null);
        setPipeline('job', null);
        setPipeline('analyze', null);
        extractPreview.hidden = true;
        extractPreview.classList.remove('open');
        extractToggle.setAttribute('aria-expanded', 'false');
        resultsContainer.hidden = true;
        resultsBody.innerHTML = '';
        streamingCursor.classList.remove('visible');
        errorContainer.style.display = 'none';
        statusText.textContent = '';
        fullMarkdown = '';
    }

    function markComplete() {
        state = 'complete';
        setPipeline('analyze', 'complete');
        streamingCursor.classList.remove('visible');
        runBtn.disabled = false;
        runBtn.classList.remove('loading');
        btnText.textContent = 'Run Again';
        statusText.textContent = 'Analysis complete.';
    }

    function setInputsDisabled(disabled) {
        portfolioInput.disabled = disabled;
        jobInput.disabled = disabled;
    }

    function hostnameFrom(url) {
        try { return new URL(url).hostname; }
        catch (e) { return url; }
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
            .replace(/^---+$/gm, '<hr>')
            .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
            .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
            .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
            .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
            .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
            .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

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

    // ---- API: Extract URL via Tabstack ----
    function extractUrl(url) {
        return fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url }),
        })
        .then(function (res) {
            if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Extraction failed'); });
            return res.json();
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.error || 'Extraction failed');
            var md = data.markdown || '';
            if (!md.trim()) throw new Error('Tabstack returned empty content for this URL. The page may require JavaScript rendering.');
            return md;
        });
    }

    // ---- API: Analyze candidate (streaming) ----
    function analyzeCandidate(portfolioMarkdown, jobMarkdown) {
        return fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown: portfolioMarkdown, jobMarkdown: jobMarkdown }),
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
                    buffer = lines.pop();

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
        if (state === 'extracting-portfolio' || state === 'extracting-job' || state === 'analyzing') return;

        var portfolioUrl = portfolioInput.value.trim();
        var jobUrl = jobInput.value.trim();

        if (!portfolioUrl) { portfolioInput.focus(); return; }
        if (!jobUrl) { jobInput.focus(); return; }

        resetAll();
        state = 'extracting-portfolio';
        runBtn.disabled = true;
        setInputsDisabled(true);
        runBtn.classList.add('loading');
        btnText.textContent = 'Running...';

        // Update pipeline descriptions
        descPortfolio.textContent = hostnameFrom(portfolioUrl);
        descJob.textContent = hostnameFrom(jobUrl);

        var portfolioMarkdown = '';
        var jobMarkdown = '';

        // Step 1: Extract portfolio
        statusText.textContent = 'Extracting candidate portfolio via Tabstack...';
        setPipeline('portfolio', 'active');

        extractUrl(portfolioUrl)
            .then(function (md) {
                portfolioMarkdown = md;
                setPipeline('portfolio', 'complete');

                // Step 2: Extract job description
                state = 'extracting-job';
                statusText.textContent = 'Extracting job description via Tabstack...';
                setPipeline('job', 'active');

                return extractUrl(jobUrl);
            })
            .then(function (md) {
                jobMarkdown = md;
                setPipeline('job', 'complete');

                // Show extraction preview (combined)
                var combined = portfolioMarkdown + '\n\n---\n\n' + jobMarkdown;
                var wordCount = combined.split(/\s+/).length;
                extractStats.textContent = wordCount.toLocaleString() + ' words extracted from both pages';
                extractContent.textContent = combined.length > 3000 ? combined.slice(0, 3000) + '\n\n[truncated for preview]' : combined;
                extractPreview.hidden = false;

                // Step 3: Claude analysis
                state = 'analyzing';
                statusText.textContent = 'Streaming Claude analysis...';
                setPipeline('analyze', 'active');
                resultsContainer.hidden = false;
                streamingCursor.classList.add('visible');

                return analyzeCandidate(portfolioMarkdown, jobMarkdown);
            })
            .then(function () {
                setInputsDisabled(false);
                markComplete();
            })
            .catch(function (err) {
                setInputsDisabled(false);

                // If stream cut but we have content, treat as complete
                if (state === 'analyzing' && fullMarkdown) {
                    markComplete();
                    return;
                }

                state = 'error';
                streamingCursor.classList.remove('visible');
                errorMessage.textContent = err.message || 'Something went wrong. Please try again.';
                errorContainer.style.display = 'flex';
                runBtn.disabled = false;
                runBtn.classList.remove('loading');
                btnText.textContent = 'Try Again';
                statusText.textContent = '';

                if (!portfolioMarkdown) {
                    setPipeline('portfolio', null);
                } else if (!jobMarkdown) {
                    setPipeline('job', null);
                } else {
                    setPipeline('analyze', null);
                }
            });
    }

    // ---- Button handler ----
    runBtn.addEventListener('click', runDemo);

})();
