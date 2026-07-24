import os
import pickle
from typing import Optional,List,Dict,Any,Tuple

import numpy as np
import pandas as pd
import httpx 
from fastapi import FastAPI , HTTPException,Query
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DF_PATH = os.path.join(BASE_DIR, "df.pkl")
INDICES_PATH = os.path.join(BASE_DIR, "indices.pkl")
TFIDF_MATRIX_PATH = os.path.join(BASE_DIR, "tfidf_matrix.pkl")
TFIDF_PATH = os.path.join(BASE_DIR, "tfidf.pkl")

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df: Optional[pd.DataFrame] = None
indices: Any = None
tfidf_matrix: Any = None
tfidf_obj: Any = None

@app.on_event("startup")
def load_models():
    global df, indices, tfidf_matrix, tfidf_obj

    with open(DF_PATH, "rb") as f:
        df = pickle.load(f)

    with open(INDICES_PATH, "rb") as f:
        indices = pickle.load(f)

    with open(TFIDF_MATRIX_PATH, "rb") as f:
        tfidf_matrix = pickle.load(f)

    with open(TFIDF_PATH, "rb") as f:
        tfidf_obj = pickle.load(f)

    print("All models loaded successfully")
    print("DF Length =", len(df))
    print("TFIDF Shape =", tfidf_matrix.shape)
    print("Indices Length =", len(indices))
   


@app.get("/")
def home():
    return {"message": "Movie API is running 🚀"}


@app.get('/get-top-movies')
def get_top_movies():

    df_sorted = df.copy()

    df_sorted["score"] = (
        df_sorted["popularity"].fillna(0) * 0.6 +
        df_sorted["vote_average"].fillna(0) * 0.4
    )

    top_movies = df_sorted.sort_values(by='score' , ascending=False).head(20)

    return top_movies[[
        "id",
        "title",
        "poster_path",
        "backdrop_path",
        "vote_average",
        "popularity",
        "overview"
    ]].to_dict(orient="records")


@app.get("/recommend/{title}")
def recommend(title: str, n: int = 10):

    if title not in indices:
        return {"message": "Movie not found"}

    idx = indices[title]

    # Safety check
    if idx >= len(df):
        return {"message": "Movie index out of range. Rebuild pickle files."}

    # Similarity score
    sim_scores = cosine_similarity(
        tfidf_matrix[idx],
        tfidf_matrix
    ).flatten()

    # Top similar movies
    similar_idx = sim_scores.argsort()[::-1][1:n+1]

    # Invalid indexes remove
    similar_idx = [i for i in similar_idx if i < len(df)]

    # Recommendations
    recommendations = df.iloc[similar_idx][[
        "id",
        "title",
        "poster_path",
        "vote_average",
        "popularity",
        "overview"
    ]].to_dict(orient="records")

    # Query movie
    exact_movie = df.iloc[idx][[
        "id",
        "title",
        "backdrop_path",
        "poster_path",
        "vote_average",
        "popularity",
        "overview"
    ]].to_dict()

    return {
        "query_movie": exact_movie,
        "recommendations": recommendations
    }