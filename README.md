This is a great project! Here is a rewritten version of your README that is formatted for GitHub, using markdown features to make it visually appealing, professional, and easy to read.

***

# 🎓 Smart Placement Analytics Dashboard


**Smart Placement Analytics Dashboard** is a full-stack, entirely local analytics platform designed to empower colleges and universities with deep insights into student placement data. It combines interactive dashboards, robust machine learning models, and optional local LLM integration to provide a comprehensive view of placement trends without relying on any paid APIs.

## ✨ Overview
![imagealt](https://github.com/akshit4u9511/Student-Placment-Analysis/blob/420d76c8352d1a96686160a8d16ed8860f24923a/Overview.png)
This system provides a complete suite of tools for placement analysis, including:

-   **📊 Interactive Dashboards:** Visualize key placement metrics.
-   **🏢 Department & Salary Insights:** Deep dive into specific cohorts.
-   **🤖 Machine Learning Predictions:** Forecast placement outcomes and salaries.
-   **🔒 Secure Authentication:** Keep sensitive data safe.
-   **🧠 Optional Local AI Assistant:** Chat with your data using Ollama.

## 🛠️Model Insight
![imagealt](https://github.com/akshit4u9511/Student-Placment-Analysis/blob/32f583dad4f319eb6282db1468992a1b1d169b51/Model%20Insight.png)

***
## 🚀 Core Features

### A. Dashboard Analytics
Get immediate visibility into your placement data:
-   **Overview Metrics:** Total students, placed count, and placement percentage.
-   **Salary Metrics:** Highest, average, and median salary figures.
-   **Detailed Breakdowns:** Department-wise analytics, salary distribution, and yearly trends.
-   **Recruitment Insights:** Company hiring patterns and student skills analysis.

### B. Machine Learning Capabilities
Leverage predictive modeling to anticipate outcomes:
-   **Placement Prediction:** Powered by Logistic Regression.
-   **Salary Prediction:** Powered by Random Forest Regressor.
-   **Model Evaluation:** Track performance using Accuracy, Precision, Recall, F1 Score, MAE, RMSE, and R² Score.
-   **Explainability:** Understand *why* models make decisions using SHAP feature importance visualization.

### C. Security First
Built with industry-standard security practices:
-   JWT-based authentication.
-   Secure `bcrypt` password hashing.
-   Role-based access control (RBAC).
-   Protected API endpoints.

### D. Optional AI Integration (Ollama)
Run large language models locally:
-   Dataset-aware intelligent responses.
-   Completely offline—no data leaves your machine.
-   Graceful fallback system if the LLM is unavailable.

***

## 🛠️ Tech Stack

### Frontend
-   **React 18** (UI Library)
-   **Vite** (Build Tool)
-   **Tailwind CSS** (Styling)
-   **Recharts** (Data Visualization)
-   **Framer Motion** (Animations)

### Backend
-   **Python** (Core Language)
-   **FastAPI** (Web Framework)
-   **Uvicorn** (ASGI Server)

### Machine Learning & Data
-   **Scikit-learn** (Modeling)
-   **Pandas & NumPy** (Data Manipulation)
-   **SHAP** (Model Explainability)

### Database
-   **SQLite** (Default, zero-configuration)
-   **PostgreSQL** (Optional, for production scaling)

***

## 🚦 How to Run the Project

Follow these steps to get the project running locally on your machine.

### Step 1: Open the Project
Open the main project folder in Visual Studio Code.

### Step 2: Start the Backend Server
Open a terminal in VS Code (`Ctrl + \``) and navigate to the backend directory:

```bash
cd backend
```

Start the FastAPI server using Uvicorn:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

*When successful, you will see "Application startup complete".*
-   **Backend URL:** `http://localhost:8000`
-   **API Documentation (Swagger UI):** `http://localhost:8000/docs`

### Step 3: Start the Frontend Application
Open a second terminal in VS Code (click the `+` icon or `Ctrl + Shift + \`) and navigate to the frontend directory:

```bash
cd frontend
```

Start the Vite development server:

```bash
npm run dev
```

-   **Frontend URL:** `http://localhost:5173`

***

## 👨‍💻 Author

**Akshit Sharma**

📧 **Email:** [akshitsharma2468@gmail.com](mailto:akshitsharma2468@gmail.com)


