import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score,
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
import json

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


class PlacementMLPipeline:
    def __init__(self):
        self.placement_model = None
        self.salary_model = None
        self.le_dept = LabelEncoder()
        self.le_gender = LabelEncoder()
        self.scaler = StandardScaler()
        self.feature_names = [
            "cgpa", "backlogs", "internships", "projects",
            "certification_count", "aptitude_score", "communication_score",
            "department_encoded", "gender_encoded",
        ]
        self.placement_metrics = {}
        self.salary_metrics = {}
        self.shap_values_placement = None
        self.shap_values_salary = None
        self.feature_importance = []

    def prepare_data(self, records: list) -> pd.DataFrame:
        data = []
        for r in records:
            data.append({
                "cgpa": r.cgpa or 0,
                "backlogs": r.backlogs or 0,
                "internships": r.internships or 0,
                "projects": r.projects or 0,
                "certification_count": r.certification_count or 0,
                "aptitude_score": r.aptitude_score or 0,
                "communication_score": r.communication_score or 0,
                "department": r.department or "Unknown",
                "gender": r.gender or "Unknown",
                "placed": 1 if r.placed else 0,
                "salary": r.salary or 0,
            })
        df = pd.DataFrame(data)

        if len(df) < 10:
            return None

        df["department_encoded"] = self.le_dept.fit_transform(df["department"])
        df["gender_encoded"] = self.le_gender.fit_transform(df["gender"])

        return df

    def train_placement_model(self, df: pd.DataFrame):
        X = df[self.feature_names]
        y = df["placed"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.placement_model = LogisticRegression(
            max_iter=1000, random_state=42, class_weight="balanced"
        )
        self.placement_model.fit(X_train_scaled, y_train)
        y_pred = self.placement_model.predict(X_test_scaled)

        self.placement_metrics = {
            "accuracy": round(accuracy_score(y_test, y_pred), 4),
            "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
            "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
            "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        }

        # SHAP
        if SHAP_AVAILABLE:
            try:
                explainer = shap.LinearExplainer(self.placement_model, X_train_scaled)
                shap_vals = explainer.shap_values(X_test_scaled)
                importance = np.abs(shap_vals).mean(axis=0)
                self.feature_importance = [
                    {"feature": name, "importance": round(float(imp), 4)}
                    for name, imp in sorted(
                        zip(self.feature_names, importance),
                        key=lambda x: x[1], reverse=True,
                    )
                ]
            except Exception:
                self._compute_coef_importance()
        else:
            self._compute_coef_importance()

    def _compute_coef_importance(self):
        if self.placement_model is not None:
            coefs = np.abs(self.placement_model.coef_[0])
            self.feature_importance = [
                {"feature": name, "importance": round(float(imp), 4)}
                for name, imp in sorted(
                    zip(self.feature_names, coefs),
                    key=lambda x: x[1], reverse=True,
                )
            ]

    def train_salary_model(self, df: pd.DataFrame):
        placed_df = df[df["placed"] == 1].copy()
        placed_df = placed_df[placed_df["salary"] > 0]

        if len(placed_df) < 10:
            self.salary_metrics = {"error": "Not enough data"}
            return

        X = placed_df[self.feature_names]
        y = placed_df["salary"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.salary_model = RandomForestRegressor(
            n_estimators=100, random_state=42, max_depth=10
        )
        self.salary_model.fit(X_train, y_train)
        y_pred = self.salary_model.predict(X_test)

        self.salary_metrics = {
            "mae": round(mean_absolute_error(y_test, y_pred), 4),
            "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
            "r2_score": round(r2_score(y_test, y_pred), 4),
        }

    def predict_placement(self, features: dict) -> dict:
        if self.placement_model is None:
            return {"error": "Model not trained"}

        try:
            dept_encoded = self.le_dept.transform([features.get("department", "Unknown")])[0]
        except ValueError:
            dept_encoded = 0
        try:
            gender_encoded = self.le_gender.transform([features.get("gender", "Unknown")])[0]
        except ValueError:
            gender_encoded = 0

        feature_values = [
            features.get("cgpa", 0),
            features.get("backlogs", 0),
            features.get("internships", 0),
            features.get("projects", 0),
            features.get("certification_count", 0),
            features.get("aptitude_score", 0),
            features.get("communication_score", 0),
            dept_encoded,
            gender_encoded,
        ]

        X = np.array([feature_values])
        X_scaled = self.scaler.transform(X)
        proba = self.placement_model.predict_proba(X_scaled)[0]

        return {
            "placed_probability": round(float(proba[1]) * 100, 2),
            "not_placed_probability": round(float(proba[0]) * 100, 2),
            "prediction": "Placed" if proba[1] > 0.5 else "Not Placed",
            "confidence": round(float(max(proba)) * 100, 2),
        }

    def predict_salary(self, features: dict) -> dict:
        if self.salary_model is None:
            return {"error": "Model not trained"}

        try:
            dept_encoded = self.le_dept.transform([features.get("department", "Unknown")])[0]
        except ValueError:
            dept_encoded = 0
        try:
            gender_encoded = self.le_gender.transform([features.get("gender", "Unknown")])[0]
        except ValueError:
            gender_encoded = 0

        feature_values = [
            features.get("cgpa", 0),
            features.get("backlogs", 0),
            features.get("internships", 0),
            features.get("projects", 0),
            features.get("certification_count", 0),
            features.get("aptitude_score", 0),
            features.get("communication_score", 0),
            dept_encoded,
            gender_encoded,
        ]

        X = np.array([feature_values])
        prediction = self.salary_model.predict(X)[0]

        return {
            "predicted_salary": round(float(prediction), 2),
        }

    def get_model_info(self) -> dict:
        return {
            "placement_model": {
                "type": "Logistic Regression",
                "metrics": self.placement_metrics,
                "feature_importance": self.feature_importance,
            },
            "salary_model": {
                "type": "Random Forest Regressor",
                "metrics": self.salary_metrics,
            },
            "features_used": self.feature_names,
        }


# Global pipeline instance
pipeline = PlacementMLPipeline()
