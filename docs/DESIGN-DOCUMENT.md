# Design Document

## Project Title
Cross-Dataset Deepfake Detection Using EfficientNet-B0

## 1. Design Overview
The project follows a lightweight layered architecture:
- Presentation layer for explanation and demonstration
- Inference service layer for model execution
- Model layer for EfficientNet-B0 classification

The design supports two goals:
- give judges a live prototype that performs real prediction
- explain the workflow clearly through guided presentation views

## 2. OO Approach

### Main Design Idea
The system uses modular responsibilities instead of a monolithic script:
- UI handles interaction and presentation flow
- inference service handles file reception and prediction
- model handler loads and runs the checkpoint

### Main Logical Objects
- `App`
- `LiveDemoSection`
- `WorkflowPoster`
- `WorkflowZoom`
- `StepInsightPanel`
- `InferenceServer`
- `ModelPredictor`

## 3. Class Diagram

```mermaid
classDiagram
    class App {
      +mode
      +stepIndex
      +render()
    }

    class LiveDemoSection {
      +selectedFile
      +prediction
      +serverStatus
      +handleFileChange()
      +handleAnalyze()
    }

    class WorkflowPoster {
      +activeId
      +onSelect()
      +render()
    }

    class WorkflowZoom {
      +step
      +render()
    }

    class StepInsightPanel {
      +step
      +phase
      +render()
    }

    class InferenceServer {
      +health()
      +predict()
    }

    class ModelPredictor {
      +loadModel()
      +preprocess()
      +infer()
      +postprocess()
    }

    App --> LiveDemoSection
    App --> WorkflowPoster
    App --> WorkflowZoom
    App --> StepInsightPanel
    InferenceServer --> ModelPredictor
```

## 4. System Structure / Architectural Diagram

```mermaid
flowchart TD
    A[User / Judge] --> B[React Presentation Website]
    B --> C[Live Demo Section]
    B --> D[Workflow Explorer]
    B --> E[Presenter Mode]
    C --> F[HTTP Request /predict]
    F --> G[Flask Inference Server]
    G --> H[Image Preprocessing]
    H --> I[EfficientNet-B0 Model]
    I --> J[Sigmoid / Probability]
    J --> K[Real or Fake Result]
    K --> B
```

## 5. Data Flow Diagram

```mermaid
flowchart LR
    U[User] -->|Image file| P1[Upload & Preview]
    P1 --> P2[Prediction Request]
    P2 --> P3[Preprocessing]
    P3 --> P4[EfficientNet-B0 Inference]
    P4 --> P5[Probability Calculation]
    P5 --> P6[Verdict Display]
    P6 --> U
```

## 6. Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Server
    participant Model

    User->>Frontend: Select image
    Frontend-->>User: Show preview
    User->>Frontend: Click Run prediction
    Frontend->>Server: POST /predict with image
    Server->>Model: Load / run checkpoint
    Model-->>Server: Probability scores
    Server-->>Frontend: JSON result
    Frontend-->>User: Display label, confidence, latency
```

## 7. State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> ImageSelected: user uploads image
    ImageSelected --> Predicting: user clicks predict
    Predicting --> Success: prediction returned
    Predicting --> Error: request failed / invalid image
    Error --> ImageSelected: retry
    Success --> ImageSelected: choose another image
```

## 8. Component Responsibilities

### 8.1 Frontend Presentation Layer
- Displays project overview
- Shows results and workflow explanation
- Handles upload preview and live prediction interaction

### 8.2 Inference Service Layer
- Accepts uploaded image
- Validates input
- Applies preprocessing
- Runs model inference
- Returns structured JSON

### 8.3 Model Layer
- Loads `baseline_ffpp_94.pth`
- Uses EfficientNet-B0 architecture
- Produces a binary classification score

## 9. ERD

Even though the current prototype is local and lightweight, the following conceptual ERD supports future logging and result tracking.

```mermaid
erDiagram
    USER ||--o{ PREDICTION_SESSION : creates
    PREDICTION_SESSION ||--|{ PREDICTION_RESULT : contains
    PREDICTION_RESULT ||--|| IMAGE_ASSET : uses

    USER {
      int user_id
      string name
      string role
    }

    PREDICTION_SESSION {
      int session_id
      datetime created_at
      string device_name
    }

    IMAGE_ASSET {
      int image_id
      string file_name
      string file_path
      string mime_type
    }

    PREDICTION_RESULT {
      int result_id
      int image_id
      int session_id
      string predicted_label
      float confidence
      float real_score
      float fake_score
      int processing_ms
    }
```

## 10. DB Schema

### Table: `users`
| Column | Type | Description |
|---|---|---|
| user_id | INT | Primary key |
| name | VARCHAR | User name |
| role | VARCHAR | Student, examiner, supervisor |

### Table: `prediction_sessions`
| Column | Type | Description |
|---|---|---|
| session_id | INT | Primary key |
| created_at | DATETIME | Session timestamp |
| device_name | VARCHAR | Demo machine identifier |

### Table: `image_assets`
| Column | Type | Description |
|---|---|---|
| image_id | INT | Primary key |
| file_name | VARCHAR | Uploaded image name |
| file_path | VARCHAR | Stored file path |
| mime_type | VARCHAR | Image format |

### Table: `prediction_results`
| Column | Type | Description |
|---|---|---|
| result_id | INT | Primary key |
| image_id | INT | Foreign key to image_assets |
| session_id | INT | Foreign key to prediction_sessions |
| predicted_label | VARCHAR | Real / Fake |
| confidence | FLOAT | Confidence score |
| real_score | FLOAT | Real class probability |
| fake_score | FLOAT | Fake class probability |
| processing_ms | INT | Inference time in milliseconds |

## 11. Design Rationale
- EfficientNet-B0 was selected because it balances compactness and performance.
- A local Flask server was chosen to avoid dependency on internet connectivity during defense.
- The presentation website and model service are separated so the UI remains clean and maintainable.
- Presenter mode is included to improve explanation quality during viva/demo.

## 12. Risks and Future Improvements
- Class mapping should be validated with known real and fake test images before final defense.
- Face-focused inputs should be used because the model was trained on face imagery.
- Future work may include:
  - video-based inference
  - persistent result logging
  - user authentication
  - cloud deployment
