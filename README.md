DecoBot 🤖 — Rule-Based AI Chatbot


DecodeLabs | Batch 2026 | Project 1



A lightweight, rule-based chatbot built in pure Python — no ML libraries, no APIs, no training data. Just clean logic.


📌 What It Does

DecoBot takes a user's text input, normalizes it, and looks up a matching response from a predefined knowledge base. It's a great starting point for understanding how AI systems process and respond to natural language before diving into machine learning.


🗂️ Project Structure

chatbot.py
│
├── responses {}        # Knowledge base (dictionary / hash map)
├── sanitize()          # Phase 1 — Input normalization
├── get_response()      # Phase 2 — Intent matching (O(1) lookup)
└── main()              # Phase 3 — Conversation loop


⚙️ How It Works

Phase 1 — Input Sanitization

Raw user input is lowercased and stripped of whitespace, ensuring consistent matching regardless of how the user types.

pythondef sanitize(raw: str) -> str:
    return raw.lower().strip()

Phase 2 — Intent Matching

The cleaned input is looked up directly in a Python dictionary. This gives O(1) lookup time — no looping through conditions.

pythondef get_response(clean_input: str) -> str:
    return responses.get(clean_input, "🤔 I don't understand that yet...")

Phase 3 — Conversation Loop

An infinite loop keeps the chatbot alive until the user types exit or quit.


🧠 Knowledge Base Topics

CategoryExample InputsGreetingshello, hi, heyFarewellsbye, goodbyeIdentitywho are you, your nameCapabilitieswhat can you do, helpAI Topicswhat is ai, what is ml, what is nlp, what is deep learningDecodeLabswhat is decodelabs, about decodelabsFun / Miscjoke, tell me a fact, how are you, thanks


🚀 Getting Started

Prerequisites


Python 3.x (no external libraries needed)


Run the Chatbot

bashpython chatbot.py

Example Session

=======================================================
  DecoBot 🤖 | DecodeLabs Rule-Based Chatbot
  Type 'exit' or 'quit' to end the session.
=======================================================

You: hello
DecoBot: Hey there! 👋 I'm DecoBot. How can I help you today?

You: what is ai
DecoBot: AI (Artificial Intelligence) is the simulation of human intelligence by machines. 🧠

You: joke
DecoBot: Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄

You: exit
DecoBot: Shutting down. Great work today! 🚀
=======================================================


🔧 Extending DecoBot

To add new responses, simply add a key-value pair to the responses dictionary in chatbot.py:

pythonresponses = {
    ...
    "your new phrase": "Your custom response here!",
}

For more advanced matching (partial matches, synonyms), consider extending get_response() with substring or fuzzy matching logic.


📚 Concepts Demonstrated


Dictionary / Hash Map as a knowledge base
O(1) lookup vs linear if-elif chains
Input normalization (sanitization)
Graceful fallback for unrecognized inputs
Control flow with infinite loops and exit conditions



🏷️ Tech Stack


Language: Python 3
Libraries: None (standard library only)
Paradigm: Rule-based / deterministic AI



👤 Author

Built as part of the DecodeLabs Batch 2026 AI Internship Program — Project 1.
