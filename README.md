<div align="center">

# 🚀 Logistic AI — Smart Supply Chain Optimization Platform

**AI-powered logistics platform combining Machine Learning, Multi-Agent AI, and Real-Time Visualization to solve modern supply chain challenges.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://logistic-ai-three.vercel.app)
[![Python](https://img.shields.io/badge/Python-95%25-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://github.com/Dhruta25/Logistic-AI)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📌 What Problem Does This Solve?

Traditional logistics systems are **static, reactive, and blind** — they can't predict delays, can't optimize routes dynamically, and offer no intelligent decision-making layer.

| ❌ Old Way | ✅ Logistic AI |
|---|---|
| Fixed, manual route planning | AI-driven dynamic route optimization |
| Delays discovered after the fact | ML-based delay prediction before shipment |
| No real-time visibility | Live map tracking with vehicle positions |
| No user interaction layer | Conversational AI chatbot for shipment queries |
| Siloed operations | Unified multi-agent AI ecosystem |

---

## 🎯 Key Features

### 🤖 1. Multi-Agent AI System
Three specialized intelligent agents work in parallel:

| Agent | Role |
|---|---|
| 📊 **Delay Prediction Agent** | Uses a trained ML model to forecast shipment delays based on route, carrier, and historical data |
| 🛣️ **Route Optimization Agent** | Suggests the fastest, most cost-efficient delivery paths dynamically |
| 💬 **Chatbot Agent** | Answers natural language queries like *"Where is my shipment?"* using LLM + optional RAG |

### 📍 2. Real-Time Visualization *(Standout Feature)*
- 🗺️ **Interactive map UI** with live vehicle positions
- 🚚 **Route rendering** — see the full delivery path
- ⚠️ **Delay alerts** — flagged proactively on the dashboard
- 📊 **Shipment analytics** panel

### 📈 3. Machine Learning Pipeline
- Trained on real logistics data (`Delivery_Logistics.csv`)
- Preprocessed and exported as `pipeline_model.pkl` (scikit-learn pipeline)
- Supports real-time inference via REST API endpoint
- Full training notebook: [`Logistic_ML.ipynb`](./Logistic_ML.ipynb)

### 🔐 4. Authentication System
- User Signup / Login
- Protected routes and profile page
- Session management

### 🔗 5. Full Stack Integration
- React frontend ↔ FastAPI backend via Axios
- Modular agent architecture under `/agents`
- API-first design — easily extensible

---

## 🏗️ System Architecture

```
User (Browser)
     │
     ▼
React.js Frontend  ──────────────────────────────────────┐
(Map UI, Dashboard, Chatbot, Auth)                        │
     │                                                    │
     ▼  HTTP / REST                                       │
FastAPI Backend (main.py)                                 │
     │                                                    │
     ├──────────────────────────────────────────┐         │
     │                                          │         │
     ▼                                          ▼         │
Delay Prediction Agent         Route Optimization Agent   │
(pipeline_model.pkl)           (agents/)                  │
     │                                          │         │
     └──────────────┬───────────────────────────┘         │
                    ▼                                      │
           Chatbot / LLM Agent ◄────────────────────────-─┘
           (LangChain + Groq/OpenAI API)
                    │
                    ▼
           Database (MySQL / SQLite)
```

### 🔄 Request Flow

```
1. User logs in → Auth verified
2. User inputs shipment details
3. FastAPI routes request to the relevant agent(s)
4. ML model predicts delay probability
5. Route agent calculates optimal delivery path
6. Chatbot agent responds to natural language queries
7. Frontend renders results on interactive map
```

---

## 🧠 Tech Stack

### 🖥️ Frontend
| Tool | Purpose |
|---|---|
| React.js | Component-based UI framework |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client for API calls |
| Mapbox / Leaflet | Real-time map visualization |

### ⚙️ Backend
| Tool | Purpose |
|---|---|
| FastAPI | High-performance Python API server |
| Python | Core language |
| Uvicorn | ASGI server |

### 🤖 AI / ML
| Tool | Purpose |
|---|---|
| Scikit-learn | Delay prediction pipeline |
| Pandas & NumPy | Data preprocessing |
| Jupyter Notebook | Model training & EDA |
| LangChain / LangGraph | Agent orchestration |
| Groq / OpenAI API | LLM for chatbot agent |

### 🗄️ Data & Storage
| Tool | Purpose |
|---|---|
| MySQL / SQLite | Shipment & user data |
| `Delivery_Logistics.csv` | Training dataset |
| `pipeline_model.pkl` | Serialized ML model |

### 🚀 Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / Railway |

---

## 📂 Project Structure

```
Logistic-AI/
│
├── agents/                  # AI agents (delay, route, chatbot)
├── MLlogi_new/              # ML model training & preprocessing files
├── src/                     # React frontend source code
├── public/                  # Static assets
│
├── main.py                  # FastAPI backend entry point
├── pipeline_model.pkl       # Trained scikit-learn ML model
├── Logistic_ML.ipynb        # Model training notebook (EDA + ML)
├── Delivery_Logistics.csv   # Raw logistics dataset
├── preprocess data.csv      # Cleaned/preprocessed dataset
├── test_endpoints.py        # API endpoint tests
├── index.html               # Frontend HTML shell
├── package.json             # Node.js dependencies
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- Groq / OpenAI API key (for chatbot agent)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Dhruta25/Logistic-AI.git
cd Logistic-AI
```

---

### 2️⃣ Backend Setup

```bash
# Install Python dependencies
pip install fastapi uvicorn scikit-learn pandas numpy langchain openai python-dotenv

# Create environment file
cp .env.example .env
# Add your API keys to .env

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 3️⃣ Frontend Setup

```bash
# Install Node dependencies
npm install

# Start React dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 4️⃣ Environment Variables

Create a `.env` file in the root:

```env
OPENAI_API_KEY=your_openai_or_groq_key_here
DATABASE_URL=sqlite:///./logistics.db
SECRET_KEY=your_jwt_secret_key
```

---

## 📊 ML Model Details

The delay prediction model was trained on the `Delivery_Logistics.csv` dataset.

**Features used:**
- Carrier type
- Distance (km)
- Weather conditions
- Origin / Destination
- Historical delay patterns

**Pipeline:**
```
Raw Input → Preprocessing → Feature Encoding → ML Classifier → Delay Probability
```

**Model file:** `pipeline_model.pkl` (scikit-learn Pipeline)

To retrain or explore:
```bash
jupyter notebook Logistic_ML.ipynb
```

---

## 🌐 Live Demo

> **[logistic-ai-three.vercel.app](https://logistic-ai-three.vercel.app)**

The live deployment features the full dashboard with route visualization, shipment tracking, and the chatbot agent interface.

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Dhruta** — [@Dhruta25](https://github.com/Dhruta25)

---

<div align="center">

⭐ **If this project helped you or inspired you, please give it a star!** ⭐

</div>
