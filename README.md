Tech Stack Recommender — AI Career Path Matcher

DecodeLabs | Batch 2026 | Project 3


Overview

An AI-powered career path recommender that maps a user's skills to the most suitable tech roles. Built on Content-Based Filtering using TF-IDF vectorization and Cosine Similarity — the same core technique used in production recommendation engines.


Pipeline

Input Skills → Ingestion → Scoring → Sorting → Filtering → Top-N Results

StepPhaseDescription1IngestionNormalize and join user skills into a query profile string2ScoringTF-IDF vectorize corpus + user profile → Cosine Similarity per role3SortingRank all 15 roles by similarity score (descending)4FilteringReturn Top-3 results to prevent choice overload


How It Works

Content-Based Filtering

Each job role in the catalogue is represented as a "document" — a bag of skill tags. When a user enters their skills, that input becomes another document in the same vocabulary space. TF-IDF then weights terms by how specific and informative they are (rare skills score higher than common ones like python), and Cosine Similarity measures the angle between the user's skill vector and each role's vector.

User: ["python", "machine learning", "deep learning"]
         ↓ TF-IDF vectorized
    → compared against all 15 role vectors
         ↓ ranked by cosine similarity
    → ["AI Engineer (87%)", "ML Engineer (82%)", "Data Scientist (78%)"]

Cold Start Handling

If no skills are provided, the system falls back to showing trending roles rather than returning an error.


Job Catalogue

15 roles across data, engineering, cloud, and security domains:

DomainRolesData & AIData Scientist, ML Engineer, Data Analyst, Data Engineer, AI Engineer, NLP EngineerDevelopmentBackend Developer, Frontend Developer, Full Stack Developer, Mobile DeveloperInfrastructureDevOps Engineer, Cloud Architect, Systems AdministratorSpecializedCybersecurity Analyst, Database Administrator


Requirements

bashpip install scikit-learn

LibraryPurposescikit-learnTF-IDF vectorizer + Cosine Similarity

No external data files needed — the knowledge base is built in.


Usage

bashpython recommender.py

The script runs an interactive loop in the terminal.

  Enter your skills below (minimum 3 recommended).
  Type 'exit' to quit.

  Your Skills (comma-separated): python, machine learning, docker, api

Minimum 3 skills recommended for accurate matching.

Available Keywords (examples)

python, java, javascript, sql, html, css, react, typescript
machine learning, deep learning, nlp, computer vision, algorithms
docker, kubernetes, aws, azure, terraform, ci cd, cloud computing
networking, security, linux, bash, git, automation
data analysis, data pipelines, data visualization, etl
api, rest, microservices, databases, spark, kafka


Sample Output

==========================================================
  🎯  TOP RECOMMENDED CAREER PATHS FOR YOU
==========================================================
  Your Skills : python, machine learning, docker, api
----------------------------------------------------------

  🥇  AI Engineer
      Match Score : 84.3%  █████████████████████████
      Key Matches : python, machine learning, docker, api

  🥈  ML Engineer
      Match Score : 79.1%  ███████████████████████
      Key Matches : python, machine learning, docker, api

  🥉  Data Scientist
      Match Score : 61.2%  ██████████████████
      Key Matches : python, machine learning

==========================================================


File Structure

project-3/
│
├── recommender.py   # Main script — knowledge base + pipeline + CLI
└── README.md        # This file


Key Concepts

Why TF-IDF over simple keyword matching?
Raw keyword overlap treats all skills equally. TF-IDF weights skills by their specificity — a niche term like transformers or terraform signals a stronger role match than a ubiquitous one like python, which appears in almost every role.

Why Cosine Similarity?
It measures the angle between two vectors rather than their magnitude, making it robust to differences in how many skills a user lists. Someone entering 3 skills or 10 skills gets a fair comparison.

Why Top-3 results?
Limiting output to 3 prevents decision fatigue — a well-established UX principle in recommendation systems. The top_n parameter in get_recommendations() can be adjusted if needed.
