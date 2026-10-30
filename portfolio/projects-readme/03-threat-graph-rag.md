# threat-graph-rag

> Sovereign, Graph-Driven Threat Intelligence & Local RAG Architecture for Enterprise Incident Correlation and Automated Risk Modeling.

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat-square&logo=python)](https://python.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph_Database-008CC1?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![Local LLM](https://img.shields.io/badge/Local_LLMs-Ollama%20%2F%20vLLM-blueviolet?style=flat-square)](https://ollama.ai/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

Modern Cyber Threat Intelligence (CTI) platforms frequently ingest voluminous, unstructured data feeds (OSINT, SOCMINT, CVE advisories, and internal sensor logs). Analyzing relationships between threat actors, malware campaigns, enterprise assets, and exploited vulnerabilities requires non-relational graph traversal.

Simultaneously, leveraging cloud-based Large Language Models introduces severe data-exfiltration risks when analyzing proprietary or classified security events.

`threat-graph-rag` solves this duality by uniting a **Neo4j Property Graph** with an air-gapped **Local RAG Pipeline**, allowing analysts to perform natural language inquiries translated into Cypher queries, correlate multi-hop attack paths, and generate risk assessments with **100% data sovereignty**.

---

## Architecture

```mermaid
flowchart TD
    OSINT["OSINT / SOCMINT Ingestion"] --> Ingest["Ingestion & Parsing Worker\n(Python Pipelines)"]
    Sensors["Internal PSIM & Log Telemetry"] --> Ingest

    Ingest --> EntityExt["Entity & Indicator Extraction\n(STIX 2.1 / MITRE ATT&CK)"]
    EntityExt --> GraphDB[("Neo4j Graph Database\n(Threat Actors, TTPs, Vulnerabilities, Assets)")]

    UserQuery["Security Analyst Query\n(Natural Language)"] --> API["FastAPI Gateway"]
    API --> Retriever["Hybrid Retriever\n(Graph Traversals + Vector Embeddings)"]

    GraphDB <-->|"Cypher Query\n(Multi-Hop Relationships)"| Retriever
    VectorStore[("Local Vector Index\n(FAISS / ChromaDB)")] <-->|"Semantic Similarity"| Retriever

    Retriever --> Context["Context Aggregator & Prompt Builder"]
    Context --> LocalLLM["Air-Gapped Local LLM\n(Ollama / vLLM runtime)"]

    LocalLLM --> Report["Actionable Threat Brief & Risk Score\n(Zero Cloud Egress)"]
```

---

## Key Capabilities

1. **Graph-Modeled Threat Topography:** Models security entities using standardized ontology (threat actors, malware families, CVEs, target sector, internal infrastructure nodes) in Neo4j.
2. **Sovereign Local Inference:** Employs quantized open-weights models running completely on-premises to guarantee data privacy.
3. **Multi-Hop Traversal:** Uncovers hidden relationships (e.g. indirect supply-chain compromises or reused infrastructure) invisible to traditional tabular SIEMs.
4. **Automated Risk Scoring:** Evaluates intent, capability, and target opportunity to calculate probabilistic risk indices.

---

## Quickstart

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/mariaalopez4/threat-graph-rag.git
cd threat-graph-rag

# Setup Python environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start local infrastructure
docker compose up -d neo4j ollama
```

### Run Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Author

**María López Padilla**  
Physical Security & Intelligence Analyst @ Banco de España  
[GitHub](https://github.com/mariaalopez4) • [LinkedIn](https://www.linkedin.com/in/marialopezpadilla/) • [Portfolio](https://mariaalopez4.github.io)
