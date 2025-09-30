The New Rating System (NRS) is a modular and extensible scoring system designed to evaluate and rank various media entries, such as anime and manga. It calculates scores based on "impacts" (direct score contributions) and "relations" (scores influenced by other entries), utilizing a mathematical framework that includes score embedding and linear algebra.

The project is structured around a core specification and a set of "DAH" extensions that provide specific functionalities:

**Core Specification:**
*   Defines NRS systems and contexts, which are environments for executing scoring tasks.
*   Introduces "extensions" for modularity, allowing customization and adaptation to different implementations.
*   Establishes mathematical concepts like "factor scores," "embedding," and "unembedding" for score calculation.
*   Defines core entities: "entries" (the items being scored), "impacts" (constant score contributors), and "relations" (score contributors based on other entries).
*   Outlines the score calculation process, involving embedding, constant score calculation, solving relational scores, and unembedding.

**Key Extensions:**
*   **Metadata & Identification:** `DAH_meta` for general metadata, `DAH_entry_id` and `DAH_entry_id_impl` for unique entry identification, `DAH_entry_title` for titles, `DAH_entry_progress` for consumption tracking, and `DAH_entry_bestGirl` for specific character metadata.
*   **Scoring Logic:** `DAH_factors` defines the specific categories of factor scores (e.g., Emotion, Art, Boredom), `DAH_overall_score` combines these into a single overall score, and `DAH_anime_normalize` adjusts scores to align with common rating standards.
*   **Serialization:** `DAH_serialize` and `DAH_serialize_json` define how NRS data (entries, impacts, relations, scores) is structured and serialized, particularly into JSON format.
*   **Standardized Scoring Rules:** `DAH_standards` provides detailed guidelines for assigning various types of impacts (emotional, visual, waifu, horror, boredom, meme, music, writing quality) and relations (remix, feature music, killed-by, contains), aiming for consistent and fair scoring.
*   **Mathematical Utilities:** `DAH_combine_pow` and `DAH_combine_pp` offer specific functions for combining scores.
*   **Validation Control:** `DAH_validator_suppress` allows for the suppression of specific validation rules.

In summary, we are building a comprehensive, flexible, and mathematically robust system for rating and managing media content, emphasizing extensibility through a modular extension system and standardized scoring practices. The `nrs-lib-ts` project is an implementation of this specification.