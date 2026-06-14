# ============================================================
#   DecodeLabs | Batch 2026 | Project 3
#   AI Recommendation Logic — Tech Stack Recommender
#   Pipeline: Ingestion → Scoring → Sorting → Filtering
#   Method  : Content-Based Filtering (TF-IDF + Cosine Similarity)
# ============================================================

# ── IMPORTS ──────────────────────────────────────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ════════════════════════════════════════════════════════════
#  KNOWLEDGE BASE — The Item Catalogue (raw_skills dataset)
#  Each job role is an "item" with associated skill tags.
#  All tags must share the SAME vocabulary space as user input.
# ════════════════════════════════════════════════════════════
JOB_CATALOGUE = {
    "Data Scientist": [
        "python", "machine learning", "sql", "statistics",
        "data analysis", "tensorflow", "pandas", "numpy",
        "deep learning", "data visualization"
    ],
    "ML Engineer": [
        "python", "machine learning", "tensorflow", "deep learning",
        "algorithms", "docker", "api", "numpy", "model deployment",
        "data pipelines"
    ],
    "Data Analyst": [
        "sql", "data analysis", "excel", "data visualization",
        "python", "statistics", "reporting", "pandas", "tableau",
        "business intelligence"
    ],
    "Backend Developer": [
        "python", "java", "sql", "api", "databases",
        "docker", "git", "rest", "microservices", "algorithms"
    ],
    "Frontend Developer": [
        "javascript", "html", "css", "react", "ui design",
        "web development", "git", "typescript", "api", "figma"
    ],
    "Full Stack Developer": [
        "javascript", "python", "html", "css", "react",
        "sql", "api", "git", "docker", "databases"
    ],
    "DevOps Engineer": [
        "docker", "kubernetes", "aws", "ci cd", "linux",
        "git", "automation", "cloud computing", "bash", "terraform"
    ],
    "Cloud Architect": [
        "aws", "cloud computing", "azure", "kubernetes", "docker",
        "networking", "security", "terraform", "ci cd", "linux"
    ],
    "Cybersecurity Analyst": [
        "networking", "security", "linux", "python", "ethical hacking",
        "firewalls", "cryptography", "risk assessment", "bash", "siem"
    ],
    "AI Engineer": [
        "python", "machine learning", "deep learning", "tensorflow",
        "algorithms", "nlp", "computer vision", "api", "docker",
        "data pipelines"
    ],
    "Database Administrator": [
        "sql", "databases", "oracle", "mysql", "postgresql",
        "data analysis", "backup", "performance tuning", "linux", "security"
    ],
    "Mobile Developer": [
        "java", "kotlin", "swift", "android", "ios",
        "api", "git", "ui design", "react", "flutter"
    ],
    "Systems Administrator": [
        "linux", "networking", "bash", "automation", "security",
        "windows server", "virtualization", "git", "monitoring", "docker"
    ],
    "Data Engineer": [
        "python", "sql", "data pipelines", "spark", "hadoop",
        "aws", "docker", "databases", "etl", "kafka"
    ],
    "NLP Engineer": [
        "python", "nlp", "machine learning", "deep learning",
        "tensorflow", "algorithms", "text processing", "transformers",
        "api", "data pipelines"
    ],
}

# ════════════════════════════════════════════════════════════
#  HELPER FUNCTIONS
# ════════════════════════════════════════════════════════════

def build_corpus(catalogue: dict) -> tuple:
    """
    Convert the job catalogue into parallel lists:
      roles  → ["Data Scientist", "ML Engineer", ...]
      docs   → ["python machine learning sql ...", ...]
    Each role's tags are joined into one string (a 'document').
    """
    roles = list(catalogue.keys())
    docs  = [" ".join(tags) for tags in catalogue.values()]
    return roles, docs


def get_recommendations(user_skills: list, top_n: int = 3) -> list:
    """
    4-Step Ranking Pipeline (from slides):
      Step 1 — Ingestion  : Build user profile string from inputs
      Step 2 — Scoring    : TF-IDF vectorize + Cosine Similarity
      Step 3 — Sorting    : Rank by descending similarity score
      Step 4 — Filtering  : Return only Top-N results
    """
    roles, docs = build_corpus(JOB_CATALOGUE)

    # ── STEP 1: INGESTION ─────────────────────────────────
    # Join user skills into a single query string
    user_profile = " ".join([s.lower().strip() for s in user_skills])

    # Cold Start guard — if user provides no skills, show trending
    if not user_profile.strip():
        print("\n⚠️  No skills provided — showing trending roles instead.")
        return [(role, 0.0) for role in list(JOB_CATALOGUE.keys())[:top_n]]

    # ── STEP 2: SCORING ───────────────────────────────────
    # Combine corpus + user profile for a shared vocabulary space
    all_docs = docs + [user_profile]

    # TF-IDF: rewards specific/unique terms, penalizes generic ones
    vectorizer  = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    # Cosine Similarity between user vector and every job role vector
    user_vector  = tfidf_matrix[-1]          # last row = user
    role_vectors = tfidf_matrix[:-1]         # all rows except last
    scores       = cosine_similarity(user_vector, role_vectors)[0]

    # ── STEP 3: SORTING ───────────────────────────────────
    # Pair each role with its score, sort descending
    ranked = sorted(zip(roles, scores), key=lambda x: x[1], reverse=True)

    # ── STEP 4: FILTERING ─────────────────────────────────
    # Truncate to Top-N to prevent choice overload
    return ranked[:top_n]


# ════════════════════════════════════════════════════════════
#  DISPLAY FUNCTION
# ════════════════════════════════════════════════════════════

def display_recommendations(user_skills: list, results: list) -> None:
    print("\n" + "=" * 58)
    print("  🎯  TOP RECOMMENDED CAREER PATHS FOR YOU")
    print("=" * 58)
    print(f"  Your Skills : {', '.join(user_skills)}")
    print("-" * 58)

    medals = ["🥇", "🥈", "🥉"]
    for i, (role, score) in enumerate(results):
        medal    = medals[i] if i < 3 else f"#{i+1}"
        bar      = "█" * int(score * 30)
        pct      = score * 100
        rel_tags = [t for t in JOB_CATALOGUE[role]
                    if any(s.lower() in t for s in user_skills)]

        print(f"\n  {medal}  {role}")
        print(f"      Match Score : {pct:.1f}%  {bar}")
        print(f"      Key Matches : {', '.join(rel_tags) if rel_tags else 'general overlap'}")

    print("\n" + "=" * 58)


# ════════════════════════════════════════════════════════════
#  MAIN — Interactive Loop (3+ skills required per slide spec)
# ════════════════════════════════════════════════════════════

def main():
    print("=" * 58)
    print("  DecodeLabs 🤖 | Project 3: Tech Stack Recommender")
    print("  Content-Based Filtering  |  TF-IDF + Cosine Similarity")
    print("=" * 58)
    print("\n  Available skill keywords (examples):")
    print("  python, java, sql, machine learning, deep learning,")
    print("  docker, aws, kubernetes, nlp, javascript, react,")
    print("  networking, security, data analysis, algorithms, git")
    print("-" * 58)

    while True:
        print("\n  Enter your skills below (minimum 3 recommended).")
        print("  Type 'exit' to quit.\n")

        raw = input("  Your Skills (comma-separated): ").strip()

        if raw.lower() == "exit":
            print("\n  Goodbye! Keep building! 🚀")
            break

        skills = [s.strip() for s in raw.split(",") if s.strip()]

        if len(skills) < 3:
            print(f"\n  ⚠️  You entered {len(skills)} skill(s). "
                  "Please enter at least 3 for accurate matching.")
            continue

        # Run the 4-step pipeline
        results = get_recommendations(skills, top_n=3)
        display_recommendations(skills, results)

        again = input("\n  Try another profile? (yes/no): ").strip().lower()
        if again not in ("yes", "y"):
            print("\n  Goodbye! Keep building! 🚀")
            break


# ── ENTRY POINT ──────────────────────────────────────────────
if __name__ == "__main__":
    main()
