import React, { useEffect, useMemo, useRef, useState } from "react";

const sampleImages = [
  { title: "Real sample 01", expected: "Real", src: "/real/000.png", fileName: "real-000.png" },
  { title: "Real sample 02", expected: "Real", src: "/real/012.png", fileName: "real-012.png" },
  { title: "Fake sample 01", expected: "Fake", src: "/fake/000.png", fileName: "fake-000.png" },
  { title: "Fake sample 02", expected: "Fake", src: "/fake/012.png", fileName: "fake-012.png" },
];

function isLocalHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, "");
  }

  return isLocalHost() ? "http://127.0.0.1:10000" : "/api";
}

function getPredictEndpoint() {
  if (isLocalHost() && import.meta.env.VITE_PREDICT_URL) {
    return import.meta.env.VITE_PREDICT_URL;
  }

  return `${getApiBase()}/predict`;
}

function getHealthEndpoint() {
  return getPredictEndpoint().replace(/\/predict\/?$/, "/health");
}

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 1000) / 10}%`;
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "--";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

function normalizePrediction(payload) {
  return {
    label: payload.label ?? "Unknown",
    confidence: Number(payload.confidence),
    realScore: Number(payload.realScore),
    fakeScore: Number(payload.fakeScore),
    processingMs: payload.processingMs,
    threshold: payload.threshold,
  };
}

function predictionMatchesExpected(prediction, sample) {
  if (!prediction || !sample) {
    return null;
  }

  return prediction.label.toLowerCase() === sample.expected.toLowerCase();
}

function App() {
  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageInfo, setImageInfo] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchState, setBatchState] = useState("idle");
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [requestState, setRequestState] = useState("idle");
  const [error, setError] = useState("");
  const [health, setHealth] = useState({ state: "checking", message: "Checking model server" });

  const predictEndpoint = useMemo(() => getPredictEndpoint(), []);
  const healthEndpoint = useMemo(() => getHealthEndpoint(), []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      setImageInfo(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const image = new Image();
    image.onload = () => {
      setImageInfo({
        width: image.naturalWidth,
        height: image.naturalHeight,
        size: selectedFile.size,
        type: selectedFile.type || "image",
      });
    };
    image.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const response = await fetch(healthEndpoint, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Model server returned ${response.status}`);
        }

        if (isMounted) {
          setHealth({ state: "online", message: "Model server online" });
        }
      } catch (healthError) {
        if (isMounted) {
          setHealth({
            state: "offline",
            message: "Model server not reachable",
            detail: healthError.message,
          });
        }
      }
    }

    checkHealth();
    const intervalId = window.setInterval(checkHealth, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [healthEndpoint]);

  function acceptFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setSelectedSample(null);
    setPrediction(null);
    setError("");
    setRequestState("idle");
  }

  function handleFileChange(event) {
    acceptFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/")));
  }

  async function requestPrediction(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(predictEndpoint, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || `Prediction failed with status ${response.status}`);
    }

    return normalizePrediction(payload);
  }

  async function runPrediction(file = selectedFile, sample = selectedSample) {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setRequestState("loading");
    setError("");
    setPrediction(null);

    try {
      const nextPrediction = await requestPrediction(file);
      const matched = predictionMatchesExpected(nextPrediction, sample);

      setPrediction(nextPrediction);
      setHistory((currentHistory) =>
        [
          {
            id: `${Date.now()}-${file.name}`,
            name: sample?.title || file.name,
            expected: sample?.expected || "Uploaded",
            label: nextPrediction.label,
            confidence: nextPrediction.confidence,
            processingMs: nextPrediction.processingMs,
            matched,
          },
          ...currentHistory,
        ].slice(0, 5),
      );
      setRequestState("success");
    } catch (predictionError) {
      setError(predictionError.message);
      setRequestState("error");
    }
  }

  function handleBatchChange(event) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    setBatchFiles(files);
    setBatchResults([]);
    setBatchState("idle");
    setError("");
  }

  async function runBatchPrediction() {
    if (batchFiles.length === 0) {
      setError("Please choose batch images first.");
      return;
    }

    setBatchState("loading");
    setError("");
    setBatchResults([]);

    const nextResults = [];

    for (const file of batchFiles) {
      try {
        const result = await requestPrediction(file);
        const row = {
          id: `${Date.now()}-${file.name}-${nextResults.length}`,
          name: file.name,
          label: result.label,
          confidence: result.confidence,
          realScore: result.realScore,
          fakeScore: result.fakeScore,
          processingMs: result.processingMs,
        };

        nextResults.push(row);
        setBatchResults([...nextResults]);
      } catch (batchError) {
        nextResults.push({
          id: `${Date.now()}-${file.name}-${nextResults.length}`,
          name: file.name,
          label: "Error",
          confidence: Number.NaN,
          realScore: Number.NaN,
          fakeScore: Number.NaN,
          processingMs: "--",
          error: batchError.message,
        });
        setBatchResults([...nextResults]);
      }
    }

    setBatchState("success");
  }

  function downloadReport() {
    const generatedAt = new Date().toLocaleString();
    const mainRows = prediction
      ? `
        <tr><td>Selected image</td><td>${selectedSample?.title || selectedFile?.name || "Uploaded image"}</td></tr>
        <tr><td>Image resolution</td><td>${imageInfo ? `${imageInfo.width} x ${imageInfo.height}` : "--"}</td></tr>
        <tr><td>File size</td><td>${imageInfo ? formatFileSize(imageInfo.size) : "--"}</td></tr>
        <tr><td>Prediction</td><td>${prediction.label}</td></tr>
        <tr><td>Confidence</td><td>${formatPercent(prediction.confidence)}</td></tr>
        <tr><td>Real score</td><td>${formatPercent(prediction.realScore)}</td></tr>
        <tr><td>Fake score</td><td>${formatPercent(prediction.fakeScore)}</td></tr>
        <tr><td>Inference time</td><td>${prediction.processingMs} ms</td></tr>
      `
      : `<tr><td colspan="2">No single-image prediction captured.</td></tr>`;

    const batchRows =
      batchResults.length > 0
        ? batchResults
            .map(
              (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.label}</td>
                  <td>${formatPercent(item.confidence)}</td>
                  <td>${item.processingMs} ms</td>
                </tr>
              `,
            )
            .join("")
        : `<tr><td colspan="4">No batch results captured.</td></tr>`;

    const reportHtml = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Deepfake Detection Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #102027; margin: 36px; }
            h1 { font-family: Georgia, serif; font-size: 34px; margin-bottom: 6px; }
            p { color: #60717a; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #d7dfdd; padding: 10px; text-align: left; }
            th { background: #eef6f5; }
            .meta { background: #f7faf9; border: 1px solid #d7dfdd; padding: 14px; border-radius: 12px; }
          </style>
        </head>
        <body>
          <h1>Deepfake Detection Report</h1>
          <div class="meta">
            <p><strong>Generated:</strong> ${generatedAt}</p>
            <p><strong>Model:</strong> EfficientNet-B0 image classifier</p>
            <p><strong>Decision threshold:</strong> ${prediction?.threshold ?? "0.5"}</p>
          </div>

          <h2>Single Image Result</h2>
          <table>
            <tbody>${mainRows}</tbody>
          </table>

          <h2>Batch Results</h2>
          <table>
            <thead>
              <tr><th>Image</th><th>Prediction</th><th>Confidence</th><th>Time</th></tr>
            </thead>
            <tbody>${batchRows}</tbody>
          </table>
        </body>
      </html>`;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deepfake-detection-report.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function loadSampleImage(sample) {
    setError("");
    setPrediction(null);
    setRequestState("loading");
    setSelectedSample(sample);

    try {
      const response = await fetch(sample.src);
      if (!response.ok) {
        throw new Error(`Could not load ${sample.title}`);
      }

      const blob = await response.blob();
      const file = new File([blob], sample.fileName, { type: blob.type || "image/png" });
      setSelectedFile(file);
      await runPrediction(file, sample);
    } catch (sampleError) {
      setError(sampleError.message);
      setRequestState("error");
    }
  }

  function resetDemo() {
    setSelectedFile(null);
    setSelectedSample(null);
    setPrediction(null);
    setImageInfo(null);
    setRequestState("idle");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const labelTone = String(prediction?.label || "").toLowerCase();
  const realPercent = Math.max(0, Math.min(100, (prediction?.realScore || 0) * 100));
  const fakePercent = Math.max(0, Math.min(100, (prediction?.fakeScore || 0) * 100));
  const confidencePercent = Math.max(0, Math.min(100, (prediction?.confidence || 0) * 100));
  const sampleMatch = predictionMatchesExpected(prediction, selectedSample);
  const imageReady = imageInfo ? imageInfo.width >= 224 && imageInfo.height >= 224 : false;

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">EfficientNet-B0 Deepfake Detection</p>
          <h1>Test if an image is real or fake.</h1>
          <p className="hero-copy">
            Upload a face image or choose a sample. The trained model runs inference and returns a
            clear prediction with confidence scores.
          </p>
        </div>

        <div className={`server-pill ${health.state}`}>
          <span />
          <strong>{health.message}</strong>
        </div>
      </section>

      <section className="proof-strip" aria-label="Live detector proof points">
        <article>
          <span>Model</span>
          <strong>EfficientNet-B0</strong>
        </article>
        <article>
          <span>Input size</span>
          <strong>224 x 224</strong>
        </article>
        <article>
          <span>Live samples</span>
          <strong>{sampleImages.length} ready</strong>
        </article>
        <article>
          <span>Decision</span>
          <strong>0.5 threshold</strong>
        </article>
      </section>

      <section className="detector-layout" aria-label="Deepfake image detector">
        <div className="upload-panel">
          <div className="panel-heading">
            <span>Input image</span>
            <strong>{selectedFile ? selectedFile.name : "No image selected"}</strong>
          </div>

          <div
            className={`preview-frame ${previewUrl ? "has-image" : ""} ${isDragging ? "dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected image preview" />
            ) : (
              <div className="empty-preview">
                <span>JPG / PNG / WEBP</span>
                <strong>Drop or click to select a face image</strong>
                <p>For the best demo, use a clear cropped face image.</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
              className="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <input
            ref={batchInputRef}
            className="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleBatchChange}
          />

          <div className="action-row">
            <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              Choose image
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!selectedFile || requestState === "loading"}
              onClick={() => runPrediction()}
            >
              {requestState === "loading" ? "Analyzing..." : "Analyze image"}
            </button>
            <button type="button" className="text-button" onClick={resetDemo}>
              Reset
            </button>
          </div>

          <div className="quality-panel">
            <div className="section-label">
              <span>Input quality</span>
              <strong>{imageInfo ? (imageReady ? "Ready for model" : "Low resolution") : "Waiting"}</strong>
            </div>

            <div className="quality-grid">
              <article>
                <span>Resolution</span>
                <strong>{imageInfo ? `${imageInfo.width} x ${imageInfo.height}` : "--"}</strong>
              </article>
              <article>
                <span>File size</span>
                <strong>{imageInfo ? formatFileSize(imageInfo.size) : "--"}</strong>
              </article>
              <article>
                <span>Format</span>
                <strong>{imageInfo ? imageInfo.type.replace("image/", "").toUpperCase() : "--"}</strong>
              </article>
              <article className={imageInfo ? (imageReady ? "ready" : "warning") : ""}>
                <span>Readiness</span>
                <strong>{imageInfo ? (imageReady ? "Good" : "Use clearer image") : "--"}</strong>
              </article>
            </div>
          </div>

          <div className="sample-section">
            <div className="section-label">
              <span>Quick samples</span>
              <strong>Use these to prove live prediction</strong>
            </div>

            <div className="sample-grid">
              {sampleImages.map((sample) => (
                <button
                  type="button"
                  className={`sample-card ${selectedSample?.src === sample.src ? "active" : ""}`}
                  key={sample.src}
                  onClick={() => loadSampleImage(sample)}
                >
                  <img src={sample.src} alt={sample.title} />
                  <span>{sample.title}</span>
                  <strong>Expected: {sample.expected}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="batch-section">
            <div className="section-label">
              <span>Batch testing</span>
              <strong>{batchFiles.length ? `${batchFiles.length} images selected` : "Test multiple images"}</strong>
            </div>

            <div className="batch-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => batchInputRef.current?.click()}
              >
                Choose batch images
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={batchFiles.length === 0 || batchState === "loading"}
                onClick={runBatchPrediction}
              >
                {batchState === "loading" ? "Testing batch..." : "Run batch test"}
              </button>
            </div>

            {batchResults.length > 0 ? (
              <div className="batch-table" role="table" aria-label="Batch prediction results">
                <div className="batch-row batch-head" role="row">
                  <span>Image</span>
                  <span>Prediction</span>
                  <span>Confidence</span>
                  <span>Time</span>
                </div>
                {batchResults.map((item) => (
                  <div className="batch-row" role="row" key={item.id}>
                    <span title={item.name}>{item.name}</span>
                    <strong className={item.label.toLowerCase()}>{item.label}</strong>
                    <span>{formatPercent(item.confidence)}</span>
                    <span>{typeof item.processingMs === "number" ? `${item.processingMs} ms` : "--"}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {history.length > 0 ? (
            <div className="history-section">
              <div className="section-label">
                <span>Recent tests</span>
                <strong>Proof from this session</strong>
              </div>

              <div className="history-list">
                {history.map((item) => (
                  <article className="history-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>Expected: {item.expected}</span>
                    </div>
                    <div className={`history-verdict ${item.label.toLowerCase()}`}>
                      <strong>{item.label}</strong>
                      <span>{formatPercent(item.confidence)}</span>
                    </div>
                    <div className="history-status">
                      {item.matched === null ? "Custom image" : item.matched ? "Match" : "Check"}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="result-panel">
          <div className="panel-heading">
            <span>Model output</span>
            <strong>
              {requestState === "loading"
                ? "Running inference"
                : prediction
                  ? "Prediction complete"
                  : "Waiting for image"}
            </strong>
          </div>

          {prediction ? (
            <div className={`verdict-card ${labelTone}`}>
              <span className="verdict-kicker">Prediction</span>
              <strong className="verdict-label">{prediction.label}</strong>
              <p>
                Confidence: <b>{formatPercent(prediction.confidence)}</b>
              </p>
              {selectedSample ? (
                <div className={`match-pill ${sampleMatch ? "match" : "miss"}`}>
                  Expected {selectedSample.expected} - {sampleMatch ? "model matched" : "review result"}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="waiting-card">
              <span>Ready</span>
              <strong>Upload an image to see the verdict here.</strong>
              <p>The result will show Real/Fake, confidence, class probabilities, and time taken.</p>
            </div>
          )}

          <div className="confidence-card">
            <div
              className="confidence-ring"
              style={{ "--confidence": `${confidencePercent * 3.6}deg` }}
              aria-label={`Confidence ${formatPercent(prediction?.confidence)}`}
            >
              <strong>{formatPercent(prediction?.confidence)}</strong>
              <span>confidence</span>
            </div>
            <p>
              Higher confidence means the model’s probability is further from the decision threshold.
            </p>
          </div>

          <div className="score-card">
            <div className="score-row">
              <div>
                <span>Real probability</span>
                <strong>{formatPercent(prediction?.realScore)}</strong>
              </div>
              <div className="score-track">
                <span style={{ width: `${realPercent}%` }} />
              </div>
            </div>

            <div className="score-row">
              <div>
                <span>Fake probability</span>
                <strong>{formatPercent(prediction?.fakeScore)}</strong>
              </div>
              <div className="score-track fake">
                <span style={{ width: `${fakePercent}%` }} />
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div>
              <span>Inference time</span>
              <strong>
                {typeof prediction?.processingMs === "number" ? `${prediction.processingMs} ms` : "--"}
              </strong>
            </div>
            <div>
              <span>Threshold</span>
              <strong>{prediction?.threshold ?? "0.5"}</strong>
            </div>
            <div>
              <span>Endpoint</span>
              <strong>{isLocalHost() ? "Local model" : "Hosted API"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{health.state}</strong>
            </div>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="pipeline-card">
            <div className="section-label">
              <span>How prediction works</span>
              <strong>Transparent inference</strong>
            </div>

            <div className="pipeline-list">
              <article>
                <span>01</span>
                <strong>Resize image</strong>
                <p>Input is prepared as a 224 x 224 RGB image.</p>
              </article>
              <article>
                <span>02</span>
                <strong>Extract features</strong>
                <p>EfficientNet-B0 reads facial texture and forgery patterns.</p>
              </article>
              <article>
                <span>03</span>
                <strong>Score classes</strong>
                <p>The model produces real and fake probability scores.</p>
              </article>
              <article>
                <span>04</span>
                <strong>Apply threshold</strong>
                <p>Probability above 0.5 becomes Fake, otherwise Real.</p>
              </article>
            </div>
          </div>

          <div className="demo-note">
            <strong>Presentation tip</strong>
            <p>
              First click a real sample, then a fake sample. Judges can see the same model respond
              live with different probabilities.
            </p>
          </div>

          <button
            type="button"
            className="report-button"
            disabled={!prediction && batchResults.length === 0}
            onClick={downloadReport}
          >
            Download result report
          </button>
        </aside>
      </section>
    </main>
  );
}

export default App;
