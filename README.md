SMART PLACEMENT ANALYTICS DASHBOARD

Project Description

Smart Placement Analytics Dashboard is a full-stack analytics platform designed to analyze student placement data through interactive dashboards, machine learning models, and optional local LLM integration.

The system runs entirely locally and does not require any paid APIs.

OVERVIEW

The system provides the following capabilities:

Placement analytics dashboard

Department and salary insights

Machine learning predictions

Secure authentication system

Optional local AI assistant (Ollama)

This platform is suitable for colleges, universities, and placement data analysis environments.

CORE FEATURES

A. Dashboard Analytics

Total students and placed count

Placement percentage calculation

Highest, average, and median salary

Department-wise analytics

Salary distribution analysis

Yearly salary trends

Company hiring insights

Skills analysis

B. Machine Learning

Placement Prediction

Algorithm: Logistic Regression

Salary Prediction

Algorithm: Random Forest Regressor

Model Evaluation Metrics

Accuracy

Precision

Recall

F1 Score

MAE (Mean Absolute Error)

RMSE (Root Mean Square Error)

R² Score

Model Explainability

SHAP feature importance visualization

C. Authentication and Security

JWT-based authentication

bcrypt password hashing

Role-based access control

Protected API endpoints

D. Optional AI Integration

Local LLM using Ollama

Dataset-aware intelligent responses

Fallback response system if LLM is not available

TECH STACK

Frontend Technologies

React 18

Vite

Tailwind CSS

Recharts

Framer Motion

Backend Technologies

Python

FastAPI

Uvicorn

Database

SQLite (default)

PostgreSQL (optional)

Machine Learning Libraries

Pandas

NumPy

Scikit-learn

SHAP

HOW TO RUN THE PROJECT

Step 1: Open the Project in VS Code

Open the main project folder in Visual Studio Code.

Step 2: Start the Backend (Terminal 1)

In VS Code, select:
Terminal > New Terminal

OR press:
Ctrl + `

Navigate to backend directory:

cd backend

Run the backend server:

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

If successful, you will see:

Application startup complete

Backend URL:
http://localhost:8000

API Documentation:
http://localhost:8000/docs

Step 3: Start the Frontend (Terminal 2)

Open a second terminal by clicking the "+" icon
OR press:
Ctrl + Shift + \

Navigate to frontend directory:

cd frontend

Start the frontend:

npm run dev

Frontend URL:
http://localhost:5173 


AUTHOR: AKSHIT SHARMA
EMAIL ID: akshitsharma2468@gmail.com