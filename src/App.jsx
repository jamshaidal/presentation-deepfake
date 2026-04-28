import React, { useEffect, useMemo, useRef, useState } from "react";

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

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 1000) / 10}%`;
}

function normalizePrediction(payload) {
  return {
    label: payload.label ?? "Unknown",
    confidence: Number(payload.confidence),
    realScore: Number(payload.realScore),
    fakeScore: Number(payload.fakeScore),
  };
}

function App() {
  const fileInputRef = useRef(null);
  const [page, setPage] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [requestState, setRequestState] = useState("idle");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const predictEndpoint = useMemo(() => getPredictEndpoint(), []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function acceptFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setSelectedFile(file);
    setPrediction(null);
    setError("");
    setRequestState("idle");
    setPage("upload");
  }

  function handleFileChange(event) {
    acceptFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(Array.from(event.dataTransfer.files).find((file) => file.type.startsWith("image/")));
  }

  async function analyzeImage() {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setRequestState("loading");
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(predictEndpoint, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Prediction failed with status ${response.status}`);
      }

      setPrediction(normalizePrediction(payload));
      setRequestState("success");
      setPage("result");
    } catch (predictionError) {
      setError(predictionError.message);
      setRequestState("error");
    }
  }

  function resetApp() {
    setSelectedFile(null);
    setPrediction(null);
    setError("");
    setRequestState("idle");
    setPage("upload");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const labelTone = String(prediction?.label || "").toLowerCase();

  if (page === "result" && prediction) {
    return (
      <main className="app-shell">
        <section className="result-page">
          <div className="result-card">
            <img src={previewUrl} alt="Uploaded image thumbnail" className="result-image" />

            <div className={`result-verdict ${labelTone}`}>
              <span>Prediction</span>
              <strong>{prediction.label}</strong>
              <p>Confidence {formatPercent(prediction.confidence)}</p>
            </div>

            <div className="score-row">
              <span>Real {formatPercent(prediction.realScore)}</span>
              <span>Fake {formatPercent(prediction.fakeScore)}</span>
            </div>

            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => setPage("upload")}>
                Back
              </button>
              <button type="button" className="primary-button" onClick={resetApp}>
                Test another image
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="upload-page">
        <div className="upload-card">
          <h1>Cross-Dataset Deepfake Detection</h1>

          <div
            className={`drop-zone ${previewUrl ? "has-image" : ""} ${isDragging ? "dragging" : ""}`}
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
              <img src={previewUrl} alt="Selected upload preview" />
            ) : (
              <div>
                <strong>Click or drop image</strong>
                <span>JPG, PNG, WEBP</span>
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

          {selectedFile ? <p className="file-name">{selectedFile.name}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          <div className="button-row">
            <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              Upload image
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!selectedFile || requestState === "loading"}
              onClick={analyzeImage}
            >
              {requestState === "loading" ? "Checking..." : "Predict"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
