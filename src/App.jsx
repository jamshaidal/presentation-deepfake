import React, { useEffect, useMemo, useRef, useState } from "react";

const project = {
  title: "Cross-Dataset Deepfake Detection",
  subtitle: "Using EfficientNet-B0 for Real vs Fake Face Classification",
  summary:
    "A presentation-first walkthrough of how a lightweight convolutional backbone can learn from manipulated face data and still remain explainable during a live project defense.",
  student: "Muhammad Jamshaid Ali",
  rollNo: "BSF2202385",
  supervisor: "Dr. Muhammad Asif",
};

const workflowRows = [
  [
    {
      id: "start",
      short: "Start",
      title: "Project Start",
      detail:
        "The workflow starts by planning the deepfake detection pipeline from dataset collection to final prediction.",
      group: "prep",
      terms: [
        {
          word: "pipeline",
          meaning:
            "Pipeline means the full sequence of steps that the system follows from beginning to end.",
        },
      ],
    },
    {
      id: "dataset",
      short: "Dataset",
      title: "Dataset of Real and Fake Videos",
      detail:
        "Real and fake videos are collected so the model can learn how genuine faces differ from manipulated faces.",
      group: "prep",
      terms: [
        {
          word: "dataset",
          meaning:
            "Dataset means the collection of training examples that we use to teach the model.",
        },
        {
          word: "manipulated",
          meaning:
            "Manipulated means the original face or video was changed artificially to look fake.",
        },
      ],
    },
    {
      id: "frame",
      short: "Frames",
      title: "Frame Extraction and Face Detection",
      detail:
        "Videos are broken into image frames, then the face is detected so the system can work on face images instead of full videos.",
      group: "prep",
      terms: [
        {
          word: "frame extraction",
          meaning:
            "Frame extraction means taking still images from a video one by one.",
        },
        {
          word: "face detection",
          meaning:
            "Face detection means finding where the face is located in the image.",
        },
      ],
    },
    {
      id: "crop",
      short: "Crop",
      title: "Face Alignment and Cropping",
      detail:
        "The face is aligned and cropped so the input becomes centered, clean, and consistent for learning.",
      group: "prep",
      terms: [
        {
          word: "alignment",
          meaning:
            "Alignment means adjusting the face so eyes and facial position are in a consistent direction.",
        },
        {
          word: "cropping",
          meaning:
            "Cropping means cutting away extra background and keeping only the useful face region.",
        },
      ],
    },
    {
      id: "augment",
      short: "Augment",
      title: "Data Augmentation",
      detail:
        "The training images are flipped, rotated, or color-adjusted so the model sees more variations and becomes stronger.",
      group: "prep",
      terms: [
        {
          word: "augmentation",
          meaning:
            "Augmentation means creating more training variety by slightly changing the original images.",
        },
        {
          word: "generalize",
          meaning:
            "Generalize means the model can still perform well on new data it did not see before.",
        },
      ],
    },
    {
      id: "resize_train",
      short: "Resize",
      title: "Resize to 224 x 224",
      detail:
        "Every face image is resized to 224 by 224 pixels because EfficientNet-B0 expects a fixed image size.",
      group: "prep",
      terms: [
        {
          word: "resolution",
          meaning:
            "Resolution means the width and height of the image in pixels.",
        },
      ],
    },
    {
      id: "backbone",
      short: "Backbone",
      title: "Feature Extraction with EfficientNet-B0",
      detail:
        "EfficientNet-B0 acts as the backbone and extracts useful patterns from each face image.",
      group: "model",
      terms: [
        {
          word: "backbone",
          meaning:
            "Backbone means the main deep learning model that does the heavy feature learning work.",
        },
        {
          word: "feature extraction",
          meaning:
            "Feature extraction means finding important visual patterns that help separate real and fake faces.",
        },
      ],
    },
  ],
  [
    {
      id: "input_train",
      short: "Train Input",
      title: "Training Input Image",
      detail:
        "A prepared face image from the training set enters the learning process.",
      group: "train",
      terms: [
        {
          word: "training set",
          meaning:
            "Training set means the examples used to teach the model during learning.",
        },
      ],
    },
    {
      id: "detect_train",
      short: "Detect",
      title: "Face Detection and Alignment",
      detail:
        "Before training, the system confirms the face position again and keeps it aligned in a standard form.",
      group: "train",
      terms: [
        {
          word: "standard form",
          meaning:
            "Standard form means all images are prepared similarly so the model does not get confused.",
        },
      ],
    },
    {
      id: "resize_infer",
      short: "Resize",
      title: "Resize Before Model Input",
      detail:
        "The final training image is resized exactly before it enters EfficientNet-B0.",
      group: "train",
      terms: [
        {
          word: "model input",
          meaning:
            "Model input means the final image that is actually fed into the neural network.",
        },
      ],
    },
    {
      id: "load_model",
      short: "Load Model",
      title: "Load Pre-Trained EfficientNet-B0",
      detail:
        "The network starts from pre-trained weights so it can learn faster using already useful visual knowledge.",
      group: "model",
      terms: [
        {
          word: "pre-trained",
          meaning:
            "Pre-trained means the model was already trained earlier on a large dataset before this task.",
        },
        {
          word: "weights",
          meaning:
            "Weights are the learned values inside the neural network that control its behavior.",
        },
      ],
    },
    {
      id: "loss",
      short: "Loss",
      title: "Loss Function and Optimizer",
      detail:
        "Binary cross-entropy measures the prediction error, and Adam updates the model weights to reduce that error.",
      group: "train",
      terms: [
        {
          word: "binary cross-entropy",
          meaning:
            "Binary cross-entropy is the formula that tells us how wrong the model is for a two-class problem like real or fake.",
        },
        {
          word: "optimizer",
          meaning:
            "Optimizer is the method that changes the weights to improve the model step by step.",
        },
      ],
    },
    {
      id: "training",
      short: "Training",
      title: "Model Training",
      detail:
        "The network learns again and again from the training images until it becomes better at distinguishing real and fake faces.",
      group: "train",
      terms: [
        {
          word: "epoch",
          meaning:
            "Epoch means one complete pass of the model through the full training data.",
        },
        {
          word: "iterative",
          meaning:
            "Iterative means the model improves by repeating the learning process many times.",
        },
      ],
    },
    {
      id: "saved",
      short: "Saved",
      title: "Saved Trained Model",
      detail:
        "After training is complete, the final EfficientNet-B0 weights are saved for later testing and prediction.",
      group: "output",
      terms: [
        {
          word: "trained model",
          meaning:
            "Trained model means the final learned version of the network after training is finished.",
        },
      ],
    },
  ],
  [
    {
      id: "input_test",
      short: "Test Input",
      title: "Testing Input Image",
      detail:
        "A new unseen face image is given to the system so it can make a prediction.",
      group: "infer",
      terms: [
        {
          word: "unseen",
          meaning:
            "Unseen means the model did not use this image during training.",
        },
      ],
    },
    {
      id: "detect_test",
      short: "Detect Face",
      title: "Face Detection",
      detail:
        "The system selects the facial region because that is where the important deepfake evidence appears.",
      group: "infer",
      terms: [
        {
          word: "facial region",
          meaning:
            "Facial region means the main face area such as eyes, nose, mouth, and surrounding skin.",
        },
      ],
    },
    {
      id: "resize_test",
      short: "Resize",
      title: "Resize for Prediction",
      detail:
        "The test face is resized to the correct input shape before prediction starts.",
      group: "infer",
      terms: [
        {
          word: "prediction",
          meaning:
            "Prediction means the model gives its final guess about the class of the image.",
        },
      ],
    },
    {
      id: "load_weights",
      short: "Weights",
      title: "Load Trained Model Weights",
      detail:
        "The saved EfficientNet-B0 weights are loaded so the system can use the learned knowledge on the new image.",
      group: "model",
      terms: [
        {
          word: "learned knowledge",
          meaning:
            "Learned knowledge means the useful patterns the model memorized during training.",
        },
      ],
    },
    {
      id: "classify",
      short: "Classify",
      title: "Classification",
      detail:
        "The model processes the image and produces scores that indicate whether it looks real or fake.",
      group: "infer",
      terms: [
        {
          word: "classification",
          meaning:
            "Classification means assigning the image to a category such as real or fake.",
        },
      ],
    },
    {
      id: "softmax",
      short: "Softmax",
      title: "Softmax Probability",
      detail:
        "The output scores are converted into probabilities so we can easily understand the confidence for each class.",
      group: "infer",
      terms: [
        {
          word: "softmax",
          meaning:
            "Softmax is the function that converts raw scores into probability values that add up to one.",
        },
        {
          word: "confidence",
          meaning:
            "Confidence means how strongly the model believes in its prediction.",
        },
      ],
    },
    {
      id: "threshold",
      short: "Threshold",
      title: "Decision Threshold",
      detail:
        "A threshold such as 0.5 is used to decide whether the image should be labeled real or fake.",
      group: "infer",
      terms: [
        {
          word: "threshold",
          meaning:
            "Threshold means the cutoff value used to turn a probability into a final decision.",
        },
      ],
    },
    {
      id: "result",
      short: "Result",
      title: "Final Output: Real or Fake",
      detail:
        "The system gives the final result, showing whether the face image is predicted as real or deepfake.",
      group: "output",
      terms: [
        {
          word: "output",
          meaning:
            "Output means the final answer produced by the model after all steps are complete.",
        },
      ],
    },
  ],
];

const steps = workflowRows.flat();

const groupLabels = {
  prep: "Data Preparation",
  model: "EfficientNet-B0",
  train: "Training",
  infer: "Inference",
  output: "Final Output",
};

const phaseCards = [
  {
    id: "phase-1",
    eyebrow: "Phase 01",
    title: "Prepare trustworthy face crops",
    blurb:
      "Clean data is the first defense against weak predictions. The presentation should show how raw videos become aligned model inputs.",
    outcome: "Videos -> frames -> faces -> normalized input",
    stepIds: ["start", "dataset", "frame", "crop", "augment", "resize_train", "backbone"],
  },
  {
    id: "phase-2",
    eyebrow: "Phase 02",
    title: "Train the compact backbone",
    blurb:
      "This section demonstrates why EfficientNet-B0 is a practical choice: light enough for deployment, strong enough to learn subtle forgery artifacts.",
    outcome: "Prepared images -> optimization -> saved model",
    stepIds: [
      "input_train",
      "detect_train",
      "resize_infer",
      "load_model",
      "loss",
      "training",
      "saved",
    ],
  },
  {
    id: "phase-3",
    eyebrow: "Phase 03",
    title: "Evaluate unseen samples and decide",
    blurb:
      "The final story is about trust. The audience needs to see how probabilities, thresholds, and the final verdict connect in a transparent way.",
    outcome: "Unseen face -> probability -> threshold -> label",
    stepIds: [
      "input_test",
      "detect_test",
      "resize_test",
      "load_weights",
      "classify",
      "softmax",
      "threshold",
      "result",
    ],
  },
];

const storyCards = [
  {
    title: "Why this matters",
    text:
      "Deepfake media makes visual evidence harder to trust. A good presentation should open with the risk before explaining the model.",
  },
  {
    title: "What this project does",
    text:
      "The system takes face imagery, learns forgery-sensitive features with EfficientNet-B0, and returns a clear real-or-fake decision.",
  },
  {
    title: "What makes it presentable",
    text:
      "Instead of burying the audience in one large poster, the site now moves from research problem to method, then into a guided interactive walkthrough.",
  },
];

const overviewStats = [
  {
    label: "Workflow coverage",
    value: `${steps.length} explained steps`,
    note: "Every stage can be opened individually during the talk.",
  },
  {
    label: "Core backbone",
    value: "EfficientNet-B0",
    note: "Compact enough to frame as an efficiency-conscious model choice.",
  },
  {
    label: "Decision style",
    value: "Probability + threshold",
    note: "Useful when explaining how softmax becomes a final label.",
  },
  {
    label: "Presentation mode",
    value: "Speaker-friendly flow",
    note: "Keyboard and button navigation reduce accidental step changes.",
  },
];

const heroIdentity = [
  {
    label: "Student",
    value: project.student,
  },
  {
    label: "Roll Number",
    value: project.rollNo,
  },
  {
    label: "Supervisor",
    value: project.supervisor,
  },
];

const evaluationCards = [
  {
    title: "Primary score",
    value: "62.20% cross-dataset accuracy",
    note:
      "On Celeb-DF testing, the model reached 0.6220 accuracy, showing that cross-dataset generalization is harder than in-domain validation.",
  },
  {
    title: "Generalization takeaway",
    value: "31.87 point drop vs in-domain",
    note:
      "Accuracy drops from 0.9407 on FaceForensics++ validation to 0.6220 on Celeb-DF, which clearly shows dataset shift effects.",
  },
  {
    title: "Best ranking signal",
    value: "0.6641 ROC-AUC on Celeb-DF",
    note:
      "Even when strict accuracy falls, ROC-AUC and average precision still show the model preserves useful ranking ability across domains.",
  },
];

const metricHighlights = [
  {
    label: "In-domain Accuracy",
    value: "94.07%",
    note: "Measured on the FaceForensics++ validation set.",
  },
  {
    label: "Cross Accuracy",
    value: "62.20%",
    note: "Measured on Celeb-DF to test cross-dataset generalization.",
  },
  {
    label: "Cross ROC-AUC",
    value: "66.41%",
    note: "Useful for showing separability even under domain shift.",
  },
  {
    label: "Cross F1-Score",
    value: "59.25%",
    note: "Balanced metric for binary `Real/Fake` classification on Celeb-DF.",
  },
];

const confusionMatrixGuide = [
  { label: "True Real", value: "3965", tone: "neutral" },
  { label: "False Fake", value: "1071", tone: "risk" },
  { label: "False Real", value: "642", tone: "risk" },
  { label: "True Fake", value: "4425", tone: "success" },
];

const samplePredictionCards = [
  {
    title: "FaceForensics++ validation",
    verdict: "In-domain baseline",
    detail:
      "Validation on the same data domain gives strong results: accuracy 0.9407, precision 0.9220, recall 0.9630, and ROC-AUC 0.9877.",
  },
  {
    title: "Celeb-DF testing",
    verdict: "Cross-dataset challenge",
    detail:
      "Testing on a different dataset is much harder: accuracy 0.6220, precision 0.6450, recall 0.5479, F1-score 0.5925, and ROC-AUC 0.6641.",
  },
  {
    title: "Main research takeaway",
    verdict: "Generalization matters",
    detail:
      "The model performs very well in-domain, but cross-dataset results reveal a meaningful generalization gap that motivates future improvement.",
  },
];

const datasetCards = [
  {
    title: "FaceForensics++ (Training and Validation)",
    lines: [
      "Total subset: 20,000 images",
      "Training set: 16,000 images",
      "Validation set: 4,000 images",
      "Validation balance: 50% real, 50% fake",
      "Manipulations: Deepfakes, Face2Face, FaceSwap, FaceShifter, NeuralTextures",
    ],
  },
  {
    title: "Celeb-DF (Testing Only)",
    lines: [
      "Total test samples: 10,103",
      "Real photos: 5,036",
      "Fake photos: 5,067",
      "Used only for cross-dataset evaluation",
    ],
  },
];

const performanceTables = [
  {
    title: "FaceForensics++ In-Domain Performance",
    subtitle: "Validation set results",
    rows: [
      ["Accuracy", "0.9407"],
      ["Precision", "0.9220"],
      ["Recall", "0.9630"],
      ["F1-score", "0.9420"],
      ["Balanced Accuracy", "0.9407"],
      ["ROC-AUC", "0.9877"],
      ["Average Precision", "0.9896"],
    ],
  },
  {
    title: "Celeb-DF Cross-Dataset Performance",
    subtitle: "Testing-only evaluation",
    rows: [
      ["Accuracy", "0.6220"],
      ["Precision", "0.6450"],
      ["Recall", "0.5479"],
      ["F1-score", "0.5925"],
      ["Balanced Accuracy", "0.6222"],
      ["ROC-AUC", "0.6641"],
      ["Average Precision", "0.6617"],
    ],
  },
];

const quickDemoSamples = [
  { title: "Real Sample A", verdict: "Real", src: "/real/000.png", fileName: "real-000.png" },
  { title: "Real Sample B", verdict: "Real", src: "/real/012.png", fileName: "real-012.png" },
  { title: "Fake Sample A", verdict: "Fake", src: "/fake/000.png", fileName: "fake-000.png" },
  { title: "Fake Sample B", verdict: "Fake", src: "/fake/012.png", fileName: "fake-012.png" },
];

const conclusionCards = [
  {
    title: "What the study achieved",
    text:
      "This work successfully developed a lightweight deepfake detection approach based on EfficientNet-B0, trained on FaceForensics++ and evaluated across more challenging settings including cross-dataset testing.",
  },
  {
    title: "Main conclusion",
    text:
      "The model is strong under in-domain validation, but cross-dataset evaluation on Celeb-DF shows a clear domain shift challenge. This confirms that building a detector is not enough; its behavior under real-world variation must also be assessed.",
  },
  {
    title: "Academic value",
    text:
      "The project does not only present a working prototype. It also provides an honest analysis of strengths, weaknesses, and practical constraints such as image degradation and changing data distributions.",
  },
];

const futureWorkItems = [
  "Improve cross-dataset generalization with stronger augmentation and more diverse training data.",
  "Test the model under additional corruptions such as blur, compression, low light, and resolution loss.",
  "Extend the system from image-level classification to video-level deepfake detection.",
  "Compare EfficientNet-B0 with newer lightweight backbones for a stronger accuracy-efficiency tradeoff.",
  "Add structured result logging and experiment tracking for future research iterations.",
];

const demoChecklist = [
  "The judge can upload an image and immediately see the chosen file preview.",
  "The interface shows one-click inference instead of switching to another tool or terminal.",
  "The verdict card is designed to display label, confidence, class scores, and latency together.",
  "As soon as you connect your real backend endpoint, this section becomes the strongest proof in the presentation.",
];

const presenterNotes = {
  prep:
    "Lead with data quality. Better crops, alignment, and augmentation improve the signal before the network ever learns.",
  model:
    "Frame EfficientNet-B0 as a balanced engineering choice: lightweight, transferable, and easier to defend than an oversized model.",
  train:
    "This is the learning loop. Explain how the optimizer uses the loss to update weights and reduce mistakes over time.",
  infer:
    "Walk from raw input to confidence score. The audience should understand how the model reaches a decision, not just what it predicts.",
  output:
    "Close the loop with impact. The final output is a simple label, but it is backed by the whole pipeline behind it.",
};

const speakerChecklist = [
  "Open with the trust problem created by deepfakes, not with the model name.",
  "Mention why EfficientNet-B0 is a practical backbone before diving into layer detail.",
  "Use the phase cards first, then zoom into the workflow only when the audience is oriented.",
  "Replace the evaluation placeholders with your final measured metrics before submission.",
];

const workflowImage = "/workflow.jpeg";
const architectureImage = "/architecture.jpeg";
const confusionMatrixImage = "/confusion_matrix.png";
const workflowImageSize = { width: 1600, height: 872 };
const architectureImageSize = { width: 1600, height: 872 };

const stepFrames = {
  start: { x: 1.8, y: 15.4, w: 8.8, h: 7.8 },
  dataset: { x: 13.5, y: 10.2, w: 12.6, h: 18.4 },
  frame: { x: 28.7, y: 10.2, w: 13.2, h: 18.4 },
  crop: { x: 44.5, y: 10.3, w: 12.4, h: 18.3 },
  augment: { x: 59.7, y: 10.3, w: 12.1, h: 18.3 },
  resize_train: { x: 76.7, y: 10.3, w: 9.1, h: 18.3 },
  backbone: { x: 88.0, y: 10.2, w: 10.8, h: 18.4 },
  input_train: { x: 3.8, y: 40.5, w: 8.0, h: 18.0 },
  detect_train: { x: 13.4, y: 40.8, w: 12.6, h: 17.9 },
  resize_infer: { x: 28.4, y: 40.8, w: 11.9, h: 17.8 },
  load_model: { x: 44.1, y: 40.8, w: 12.6, h: 17.9 },
  loss: { x: 59.2, y: 40.7, w: 12.4, h: 18.0 },
  training: { x: 74.1, y: 40.8, w: 11.7, h: 17.9 },
  saved: { x: 89.1, y: 42.9, w: 9.2, h: 14.4 },
  input_test: { x: 3.6, y: 69.0, w: 8.1, h: 18.0 },
  detect_test: { x: 13.7, y: 69.1, w: 11.8, h: 12.4 },
  resize_test: { x: 15.4, y: 81.4, w: 8.6, h: 6.2 },
  load_weights: { x: 28.8, y: 68.8, w: 13.7, h: 18.0 },
  classify: { x: 43.9, y: 68.9, w: 13.0, h: 18.0 },
  softmax: { x: 59.1, y: 68.9, w: 13.6, h: 19.8 },
  threshold: { x: 74.4, y: 69.1, w: 12.5, h: 18.0 },
  result: { x: 88.2, y: 64.5, w: 10.8, h: 26.0 },
};

const architectureSteps = [
  {
    id: "arch_input",
    title: "Input Image",
    detail: "The face image enters the architecture after resizing to the expected EfficientNet-B0 input size.",
  },
  {
    id: "arch_stem",
    title: "Stem Convolution",
    detail: "The stem convolution begins low-level feature extraction from the input image.",
  },
  {
    id: "arch_backbone",
    title: "MBConv Backbone Stages",
    detail: "The backbone stacks MBConv blocks to learn increasingly abstract deepfake-sensitive features.",
  },
  {
    id: "arch_head",
    title: "Classification Head",
    detail: "The head refines the final feature representation before prediction.",
  },
  {
    id: "arch_pool",
    title: "Global Average Pooling",
    detail: "Feature maps are compressed into a compact representation for final decision making.",
  },
  {
    id: "arch_output",
    title: "Softmax and Prediction",
    detail: "The network produces class probabilities that become the final category decision.",
  },
];

const architectureFrames = {
  arch_input: { x: 2.4, y: 16.0, w: 11.5, h: 42.0 },
  arch_stem: { x: 18.0, y: 18.8, w: 29.0, h: 15.5 },
  arch_backbone: { x: 18.0, y: 33.0, w: 56.5, h: 56.5 },
  arch_head: { x: 77.5, y: 23.0, w: 20.0, h: 20.0 },
  arch_pool: { x: 77.5, y: 42.0, w: 20.0, h: 18.0 },
  arch_output: { x: 77.5, y: 60.0, w: 20.0, h: 29.0 },
};

const stepIndexLookup = Object.fromEntries(steps.map((step, index) => [step.id, index]));

function formatPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(1)}%`;
}

function parsePredictionResult(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const label =
    payload.label ??
    payload.prediction ??
    payload.class ??
    payload.verdict ??
    payload.result ??
    null;

  const confidence =
    payload.confidence ??
    payload.score ??
    payload.probability ??
    payload.prediction_confidence ??
    null;

  const realScore =
    payload.realScore ?? payload.real_score ?? payload.real ?? payload.prob_real ?? null;

  const fakeScore =
    payload.fakeScore ?? payload.fake_score ?? payload.fake ?? payload.prob_fake ?? null;

  const processingMs =
    payload.processingMs ?? payload.processing_ms ?? payload.latencyMs ?? payload.latency ?? null;

  return {
    label,
    confidence: typeof confidence === "number" ? confidence : null,
    realScore: typeof realScore === "number" ? realScore : null,
    fakeScore: typeof fakeScore === "number" ? fakeScore : null,
    processingMs: typeof processingMs === "number" ? processingMs : null,
    raw: payload,
  };
}

function scrollToId(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="section-intro">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function ImagePoster({ imageSrc, imageAlt, items, frames, activeId, onSelect, completedIndex = -1 }) {
  return (
    <div className="workflow-poster">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="workflow-poster-image"
      />
      {items.map((item, index) => {
        const frame = frames[item.id];
        const status =
          item.id === activeId ? "current" : index <= completedIndex ? "complete" : "idle";

        return (
          <button
            type="button"
            key={item.id}
            className={`poster-hotspot ${status}`}
            style={{
              left: `${frame.x}%`,
              top: `${frame.y}%`,
              width: `${frame.w}%`,
              height: `${frame.h}%`,
            }}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
            aria-label={item.title}
          >
            <span>{index + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

function WorkflowPoster({ activeId, onSelect, completedIndex = -1 }) {
  return (
    <ImagePoster
      imageSrc={workflowImage}
      imageAlt="Deepfake detection workflow diagram"
      items={steps}
      frames={stepFrames}
      activeId={activeId}
      onSelect={onSelect}
      completedIndex={completedIndex}
    />
  );
}

function getPaddedFrame(frame) {
  const padX = Math.max(frame.w * 0.18, frame.w < 10 ? 2.8 : 0);
  const padY = Math.max(frame.h * 0.18, frame.h < 10 ? 2.2 : 0);
  const left = Math.max(0, frame.x - padX);
  const top = Math.max(0, frame.y - padY);
  const right = Math.min(100, frame.x + frame.w + padX);
  const bottom = Math.min(100, frame.y + frame.h + padY);

  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  };
}

function CroppedImagePanel({ imageSrc, imageAlt, frame, imageSize, caption }) {
  const paddedFrame = getPaddedFrame(frame);
  const imageAspectRatio = imageSize.width / imageSize.height;
  const cropAspectRatio = (paddedFrame.w * imageAspectRatio) / paddedFrame.h;
  const aspectRatio = `${cropAspectRatio}`;

  return (
    <div className="workflow-zoom-card">
      <div className="workflow-zoom-frame" style={{ aspectRatio }}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="workflow-zoom-image"
          style={{
            width: `${100 / paddedFrame.w}%`,
            transform: `translate(-${paddedFrame.x}%, -${paddedFrame.y}%)`,
          }}
        />
      </div>
      <div className="zoom-caption">{caption}</div>
    </div>
  );
}

function WorkflowZoom({ step }) {
  return (
    <CroppedImagePanel
      imageSrc={workflowImage}
      imageAlt={step.title}
      frame={stepFrames[step.id]}
      imageSize={workflowImageSize}
      caption="Workflow crop used to spotlight this stage"
    />
  );
}

function ArchitecturePoster({ activeId, onSelect }) {
  return (
    <ImagePoster
      imageSrc={architectureImage}
      imageAlt="EfficientNet-B0 architecture diagram"
      items={architectureSteps}
      frames={architectureFrames}
      activeId={activeId}
      onSelect={onSelect}
    />
  );
}

function ArchitectureZoom({ step }) {
  return (
    <CroppedImagePanel
      imageSrc={architectureImage}
      imageAlt={step.title}
      frame={architectureFrames[step.id]}
      imageSize={architectureImageSize}
      caption="Architecture crop used to explain the backbone design"
    />
  );
}

function ArchitectureSection() {
  const [activeArchitectureId, setActiveArchitectureId] = useState(architectureSteps[0].id);
  const activeArchitectureStep =
    architectureSteps.find((item) => item.id === activeArchitectureId) ?? architectureSteps[0];

  return (
    <section className="architecture-section">
      <SectionIntro
        eyebrow="Architecture"
        title="Present the EfficientNet-B0 design the same way you present the workflow"
        text="This section gives you a guided architecture tour so you can explain how the model moves from input image to final classification without leaving the presentation layout."
      />

      <div className="explorer-grid">
        <div className="panel-card explorer-poster-panel">
          <div className="panel-topline">
            <span>Architecture poster</span>
            <strong>Select any component</strong>
          </div>
          <ArchitecturePoster
            activeId={activeArchitectureStep.id}
            onSelect={setActiveArchitectureId}
          />
        </div>

        <aside className="insight-panel">
          <div className="insight-top">
            <span className="detail-kicker">EfficientNet-B0 Tour</span>
            <h3>{activeArchitectureStep.title}</h3>
            <p>{activeArchitectureStep.detail}</p>
          </div>

          <div className="detail-block">
            <span>Why it matters</span>
            <p>
              This architecture view helps you explain the backbone separately from the workflow,
              which makes the technical model design easier for judges to follow.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StepEvidence({ step }) {
  if (step.group === "model") {
    return (
      <div className="evidence-card image-evidence">
        <img
          src={architectureImage}
          alt="EfficientNet-B0 architecture reference"
          className="evidence-image"
        />
        <div className="evidence-caption">Architecture reference for the backbone stages</div>
      </div>
    );
  }

  if (step.group === "train") {
    return (
      <div className="evidence-card detail-evidence">
        <div className="evidence-row">
          <span>Loss</span>
          <strong>Binary Cross-Entropy</strong>
        </div>
        <div className="evidence-row">
          <span>Optimizer</span>
          <strong>Adam</strong>
        </div>
        <div className="evidence-row">
          <span>Presenter angle</span>
          <strong>Show how prediction error is reduced over time</strong>
        </div>
      </div>
    );
  }

  if (step.group === "infer" || step.group === "output") {
    return (
      <div className="evidence-card detail-evidence">
        <div className="evidence-row">
          <span>Decision rule</span>
          <strong>Convert logits to probabilities with softmax</strong>
        </div>
        <div className="evidence-row">
          <span>Threshold</span>
          <strong>Use a cutoff such as 0.5 for the final label</strong>
        </div>
        <div className="evidence-row">
          <span>Presenter angle</span>
          <strong>Explain confidence before announcing the class</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-card detail-evidence">
      <div className="evidence-row">
        <span>Input quality</span>
        <strong>Frames are aligned and cropped before learning</strong>
      </div>
      <div className="evidence-row">
        <span>Variation control</span>
        <strong>Augmentation helps the detector generalize better</strong>
      </div>
      <div className="evidence-row">
        <span>Presenter angle</span>
        <strong>Explain why clean preprocessing protects later accuracy</strong>
      </div>
    </div>
  );
}

function StepInsightPanel({
  step,
  stepNumber,
  phase,
  selectedTerm,
  selectedTermIndex,
  setSelectedTermIndex,
}) {
  const activeTerms = step.terms ?? [];

  return (
    <aside className="insight-panel">
      <div className="insight-top">
        <span className="detail-kicker">{phase.eyebrow}</span>
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
      </div>

      <StepEvidence step={step} />

      <div className="insight-grid">
        <div className="detail-block">
          <span>Current step</span>
          <strong>
            {stepNumber} / {steps.length}
          </strong>
        </div>
        <div className="detail-block">
          <span>Workflow group</span>
          <strong>{groupLabels[step.group]}</strong>
        </div>
      </div>

      <div className="detail-block">
        <span>Speaker cue</span>
        <p>{presenterNotes[step.group]}</p>
      </div>

      <div className="detail-block">
        <span>Key terms</span>
        <div className="term-chip-row">
          {activeTerms.map((term, index) => (
            <button
              type="button"
              key={term.word}
              className={index === selectedTermIndex ? "term-chip active" : "term-chip"}
              onClick={() => setSelectedTermIndex(index)}
            >
              {term.word}
            </button>
          ))}
        </div>
      </div>

      {selectedTerm ? (
        <div className="meaning-card">
          <span>Word meaning</span>
          <strong>{selectedTerm.word}</strong>
          <p>{selectedTerm.meaning}</p>
        </div>
      ) : null}
    </aside>
  );
}

function LiveDemoSection() {
  const inputRef = useRef(null);
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost");
  const endpoint =
    import.meta.env.VITE_PREDICT_URL || (isLocalHost ? "http://127.0.0.1:8000/predict" : "");
  const healthUrl = endpoint ? endpoint.replace(/\/predict\/?$/, "/health") : "";
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [requestState, setRequestState] = useState("idle");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!healthUrl) {
      setServerStatus("offline");
      return undefined;
    }

    let isMounted = true;

    async function checkServer() {
      try {
        const response = await fetch(healthUrl);
        if (!response.ok) {
          throw new Error("Health check failed.");
        }

        if (isMounted) {
          setServerStatus("online");
        }
      } catch {
        if (isMounted) {
          setServerStatus("offline");
        }
      }
    }

    checkServer();
    const timer = window.setInterval(checkServer, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [healthUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPrediction(null);
    setError("");
    setRequestState("idle");
  };

  const runPrediction = async (file) => {
    if (!endpoint) {
      setRequestState("error");
      setError(
        "This hosted site does not include the local Python model server. Run the live demo on your laptop or connect a hosted prediction API through VITE_PREDICT_URL.",
      );
      return;
    }

    setError("");
    setRequestState("loading");
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Prediction request failed with status ${response.status}.`);
      }

      const payload = await response.json();
      const parsed = parsePredictionResult(payload);

      if (!parsed || !parsed.label) {
        throw new Error(
          "The API responded, but the result format was missing a label/prediction field.",
        );
      }

      setPrediction(parsed);
      setRequestState("success");
    } catch (requestError) {
      setRequestState("error");
      setError(requestError.message || "Prediction failed.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Choose an image first so the judge can see the upload flow.");
      return;
    }

    await runPrediction(selectedFile);
  };

  const loadSampleImage = async (sample) => {
    try {
      const response = await fetch(sample.src);
      if (!response.ok) {
        throw new Error("Could not load sample image.");
      }

      const blob = await response.blob();
      const file = new File([blob], sample.fileName, { type: blob.type || "image/png" });
      setSelectedFile(file);
      setPrediction(null);
      setError("");
      setRequestState("idle");
      await runPrediction(file);
    } catch (sampleError) {
      setError(sampleError.message || "Could not load sample image.");
    }
  };

  return (
    <section className="demo-section">
      <SectionIntro
        eyebrow="Live Proof"
        title="Show judges the model pipeline ends in a smooth prediction experience"
        text="This section is built for a live defense: upload an image, preview it instantly, and show the final verdict card. The frontend is ready now, and it becomes fully live the moment you connect your real prediction endpoint."
      />

      <div className="demo-grid">
        <div className="panel-card demo-uploader">
          <div className="panel-topline">
            <span>Judge demo</span>
            <strong>
              {serverStatus === "online"
                ? "Local model online"
                : serverStatus === "checking"
                  ? "Checking model server"
                  : "Start local model server"}
            </strong>
          </div>

          <div className="upload-card">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />

            <div className="upload-actions">
              <button type="button" onClick={() => inputRef.current?.click()}>
                Choose image
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleAnalyze}
                disabled={requestState === "loading"}
              >
                {requestState === "loading" ? "Analyzing..." : "Run prediction"}
              </button>
            </div>

            <div className="upload-hint">
              <span>Connection</span>
              <p>
                {endpoint && serverStatus === "online"
                  ? `Live API ready at ${endpoint}`
                  : endpoint
                    ? `Expected local API at ${endpoint}. Run the Python model server before your presentation.`
                    : "Hosted presentation mode: the website is online, but the live model demo remains available on your local laptop unless you attach a hosted prediction API."}
              </p>
            </div>

            <div className="sample-demo-strip">
              {quickDemoSamples.map((sample) => (
                <button
                  type="button"
                  className="sample-demo-card"
                  key={sample.title}
                  onClick={() => loadSampleImage(sample)}
                >
                  <img src={sample.src} alt={sample.title} className="sample-demo-image" />
                  <span>{sample.title}</span>
                  <strong>{sample.verdict}</strong>
                </button>
              ))}
            </div>

            <div className="preview-panel">
              {previewUrl ? (
                <img src={previewUrl} alt="Uploaded input preview" className="preview-image" />
              ) : (
                <div className="preview-empty">
                  <strong>Upload area</strong>
                  <p>The selected test image will appear here before inference starts.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="demo-side">
          <div className="panel-card verdict-panel">
            <div className="panel-topline">
              <span>Prediction result</span>
              <strong>
                {requestState === "success"
                  ? "Inference complete"
                  : requestState === "loading"
                    ? "Running model"
                    : "Ready for live demo"}
              </strong>
            </div>

            {prediction ? (
              <div className="verdict-card">
                <div className={`verdict-badge ${String(prediction.label).toLowerCase()}`}>
                  {prediction.label}
                </div>
                <div className="verdict-metrics">
                  <div className="detail-block">
                    <span>Confidence</span>
                    <strong>{formatPercent(prediction.confidence)}</strong>
                  </div>
                  <div className="detail-block">
                    <span>Latency</span>
                    <strong>
                      {typeof prediction.processingMs === "number"
                        ? `${prediction.processingMs} ms`
                        : "--"}
                    </strong>
                  </div>
                  <div className="detail-block">
                    <span>Real score</span>
                    <strong>{formatPercent(prediction.realScore)}</strong>
                  </div>
                  <div className="detail-block">
                    <span>Fake score</span>
                    <strong>{formatPercent(prediction.fakeScore)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="verdict-placeholder">
                <strong>Verdict card ready</strong>
                <p>
                  This area will display `Real` or `Fake`, confidence, class scores, and inference
                  time after the API responds.
                </p>
              </div>
            )}

            {error ? <div className="demo-error">{error}</div> : null}
          </div>

          <div className="panel-card">
            <div className="panel-topline">
              <span>Why this helps</span>
              <strong>Stronger than screenshots</strong>
            </div>
            <div className="checklist-grid demo-checklist">
              {demoChecklist.map((item) => (
                <article className="checklist-card" key={item}>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [mode, setMode] = useState("diagram");
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);

  const activeStep = steps[stepIndex];
  const activeTerms = activeStep.terms ?? [];
  const selectedTerm = activeTerms[selectedTermIndex] ?? activeTerms[0] ?? null;

  const activePhase = useMemo(
    () => phaseCards.find((phase) => phase.stepIds.includes(activeStep.id)) ?? phaseCards[0],
    [activeStep.id],
  );

  useEffect(() => {
    setSelectedTermIndex(0);
  }, [stepIndex]);

  useEffect(() => {
    if (mode !== "presenter") {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        setStepIndex((current) => (current + 1) % steps.length);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setStepIndex((current) => (current === 0 ? steps.length - 1 : current - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode]);

  const goToStep = (stepId) => {
    const nextIndex = stepIndexLookup[stepId];
    if (typeof nextIndex === "number") {
      setStepIndex(nextIndex);
    }
  };

  const nextStep = () => setStepIndex((current) => (current + 1) % steps.length);
  const previousStep = () =>
    setStepIndex((current) => (current === 0 ? steps.length - 1 : current - 1));

  return (
    <div className="presentation-shell">
      <div className="backdrop-orb backdrop-orb-left" />
      <div className="backdrop-orb backdrop-orb-right" />
      <div className="backdrop-grid" />

      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Final Year Project Presentation</span>
          <h1>{project.title}</h1>
          <p className="hero-subtitle">{project.subtitle}</p>
          <p className="hero-summary">{project.summary}</p>

          <div className="hero-actions">
            <button type="button" onClick={() => scrollToId("explorer")}>
              Open workflow explorer
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setMode("presenter");
                scrollToId("explorer");
              }}
            >
              Launch presenter mode
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-meta">
            {heroIdentity.map((item) => (
              <article className="identity-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="stat-grid">
            {overviewStats.map((item) => (
              <article className="stat-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </header>

      <main className="presentation-main">
        <section className="story-section">
          <SectionIntro
            eyebrow="Narrative"
            title="Start the presentation with the research story"
            text="The strongest project websites do not begin with a crowded diagram. They first explain the problem, the goal, and the method in language the audience can follow."
          />

          <div className="story-grid">
            {storyCards.map((card) => (
              <article className="story-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="phase-section">
          <SectionIntro
            eyebrow="Method"
            title="Group the full pipeline into three memorable phases"
            text="These phase cards give you a clean speaking structure before you zoom into the detailed workflow. Each card can also jump directly to the matching section in the explorer."
          />

          <div className="phase-grid">
            {phaseCards.map((phase) => (
              <button
                type="button"
                className={`phase-card ${phase.id === activePhase.id ? "active" : ""}`}
                key={phase.id}
                onClick={() => {
                  setMode("diagram");
                  goToStep(phase.stepIds[0]);
                  scrollToId("explorer");
                }}
              >
                <span>{phase.eyebrow}</span>
                <h3>{phase.title}</h3>
                <p>{phase.blurb}</p>
                <strong>{phase.outcome}</strong>
              </button>
            ))}
          </div>
        </section>

        <ArchitectureSection />

        <section className="results-section">
          <SectionIntro
            eyebrow="Results"
            title="Give the audience a place to look for evidence"
            text="These results now use your actual experimental values. They show strong in-domain validation on FaceForensics++ and a clear performance drop on Celeb-DF, which supports an honest discussion of cross-dataset generalization."
          />

          <div className="evaluation-grid">
            {evaluationCards.map((card) => (
              <article className="evaluation-card" key={card.title}>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.note}</p>
              </article>
            ))}
          </div>

          <div className="dataset-grid">
            {datasetCards.map((dataset) => (
              <article className="panel-card dataset-card" key={dataset.title}>
                <div className="panel-topline">
                  <span>Dataset setup</span>
                  <strong>{dataset.title}</strong>
                </div>
                <div className="dataset-list">
                  {dataset.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="results-proof-grid">
            <div className="panel-card metrics-panel">
              <div className="panel-topline">
                <span>Metrics dashboard</span>
                <strong>Actual values from your report</strong>
              </div>

              <div className="metric-highlight-grid">
                {metricHighlights.map((metric) => (
                  <article className="metric-highlight-card" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p>{metric.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel-card confusion-panel">
              <div className="panel-topline">
                <span>Confusion matrix</span>
                <strong>FaceForensics++ validation counts</strong>
              </div>

              <div className="confusion-image-wrap">
                <img
                  src={confusionMatrixImage}
                  alt="Confusion matrix for FaceForensics++ validation"
                  className="confusion-image"
                />
              </div>

              <div className="matrix-wrapper">
                <div className="matrix-axis top-axis">
                  <span>Predicted Real</span>
                  <span>Predicted Fake</span>
                </div>

                <div className="matrix-body">
                  <div className="matrix-labels">
                    <span>Actual Real</span>
                    <span>Actual Fake</span>
                  </div>

                  <div className="matrix-grid">
                    {confusionMatrixGuide.map((cell) => (
                      <article className={`matrix-cell ${cell.tone}`} key={cell.label}>
                        <span>{cell.label}</span>
                        <strong>{cell.value}</strong>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="performance-table-grid">
            {performanceTables.map((table) => (
              <article className="panel-card performance-table-card" key={table.title}>
                <div className="panel-topline">
                  <span>Performance table</span>
                  <strong>{table.subtitle}</strong>
                </div>
                <h3>{table.title}</h3>
                <div className="performance-rows">
                  {table.rows.map(([metric, value]) => (
                    <div className="performance-row" key={`${table.title}-${metric}`}>
                      <span>{metric}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="sample-prediction-grid">
            {samplePredictionCards.map((sample) => (
              <article className="sample-prediction-card" key={sample.title}>
                <span>{sample.title}</span>
                <strong>{sample.verdict}</strong>
                <p>{sample.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <LiveDemoSection />

        <section className="explorer-section" id="explorer">
          <SectionIntro
            eyebrow="Explorer"
            title="Use the workflow as a guided visual instead of a static poster"
            text="Diagram mode helps with overview and navigation. Presenter mode is tuned for live explanation, with keyboard support and a cleaner split between visual focus and speaking notes."
          />

          <div className="explorer-toolbar">
            <div className="mode-switcher">
              <button
                type="button"
                className={mode === "diagram" ? "active" : ""}
                onClick={() => setMode("diagram")}
              >
                Diagram mode
              </button>
              <button
                type="button"
                className={mode === "presenter" ? "active" : ""}
                onClick={() => setMode("presenter")}
              >
                Presenter mode
              </button>
            </div>

            <div className="explorer-status">
              <span>{activePhase.title}</span>
              <strong>
                Step {stepIndex + 1} / {steps.length}
              </strong>
            </div>
          </div>

          {mode === "diagram" ? (
            <div className="explorer-grid">
              <div className="panel-card explorer-poster-panel">
                <div className="panel-topline">
                  <span>Interactive poster</span>
                  <strong>Select any stage</strong>
                </div>
                <WorkflowPoster activeId={activeStep.id} onSelect={goToStep} />
              </div>

              <StepInsightPanel
                step={activeStep}
                stepNumber={stepIndex + 1}
                phase={activePhase}
                selectedTerm={selectedTerm}
                selectedTermIndex={selectedTermIndex}
                setSelectedTermIndex={setSelectedTermIndex}
              />
            </div>
          ) : (
            <div className="presenter-shell">
              <div className="panel-card presenter-focus">
                <div className="panel-topline">
                  <span>Presenter view</span>
                  <strong>Use arrow keys or buttons to move</strong>
                </div>

                <div className="presenter-hero">
                  <div className="presenter-copy">
                    <span className="focus-step">Step {stepIndex + 1}</span>
                    <h3>{activeStep.title}</h3>
                    <p>{activeStep.detail}</p>
                    <div className="presenter-note">
                      <span>What to emphasize</span>
                      <p>{presenterNotes[activeStep.group]}</p>
                    </div>
                  </div>
                </div>

                <div className="travel-line">
                  <div
                    className="travel-token"
                    style={{
                      left: `${(stepIndex / Math.max(steps.length - 1, 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="control-row">
                  <button type="button" onClick={previousStep}>
                    Previous
                  </button>
                  <button type="button" onClick={() => setStepIndex(0)}>
                    Restart
                  </button>
                  <button type="button" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>

              <div className="presenter-side">
                <div className="panel-card">
                  <div className="panel-topline">
                    <span>Workflow position</span>
                    <strong>{activePhase.eyebrow}</strong>
                  </div>
                  <WorkflowPoster
                    activeId={activeStep.id}
                    completedIndex={stepIndex - 1}
                    onSelect={goToStep}
                  />
                </div>

                <StepInsightPanel
                  step={activeStep}
                  stepNumber={stepIndex + 1}
                  phase={activePhase}
                  selectedTerm={selectedTerm}
                  selectedTermIndex={selectedTermIndex}
                  setSelectedTermIndex={setSelectedTermIndex}
                />
              </div>
            </div>
          )}
        </section>

        <section className="closing-section">
          <SectionIntro
            eyebrow="Conclusion"
            title="Close the presentation with an honest research takeaway"
            text="This project developed a lightweight deepfake detector using EfficientNet-B0 and evaluated it under both strong in-domain validation and more difficult real-world style cross-dataset conditions."
          />

          <div className="story-grid">
            {conclusionCards.map((card) => (
              <article className="story-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div className="panel-card future-work-panel">
            <div className="panel-topline">
              <span>Future work</span>
              <strong>Directions for improvement</strong>
            </div>
            <div className="future-work-list">
              {futureWorkItems.map((item) => (
                <article className="checklist-card" key={item}>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>

          <SectionIntro
            eyebrow="Delivery"
            title="Final speaking checklist before you present"
            text="These reminders help the website support your oral defense instead of competing with it."
          />

          <div className="checklist-grid">
            {speakerChecklist.map((item) => (
              <article className="checklist-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
