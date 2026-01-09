# 💬 Example Prompts for Blueprint Generator

Use these prompts with the default demo repos (vercel/next.js, kubernetes/kubernetes, nodejs/node, etc).

---

## 🎯 Initial Diagram Generation

### Prompt 1: Basic Architecture
```
Generate a Mermaid diagram showing the architecture of these projects. 
Include what each project does and how they might interact.
```

### Prompt 2: Technology Stack
```
Create a diagram showing the technology stack used in these projects.
Include programming languages, frameworks, and key technologies.
```

### Prompt 3: Use Cases
```
Show a Mermaid diagram that groups these projects by their primary use case 
(e.g., infrastructure, application development, monitoring, etc).
```

### Prompt 4: Component View
```
Draw a diagram showing the major components within each of these projects.
What are the key subsystems?
```

---

## 🔍 Verification Prompts

### Prompt 5: Verify Technologies
```
Search each repository for usage of:
- Docker/Containers
- Kubernetes
- gRPC or HTTP APIs
- PostgreSQL or MySQL

Create a table showing which projects use what.
```

### Prompt 6: Find Configuration
```
Look for deployment and configuration files in each repo:
- Dockerfile / docker-compose.yml
- kubernetes manifests
- terraform / infrastructure as code
- CI/CD workflows

Show what deployment methods each project uses.
```

### Prompt 7: Documentation
```
Read the README.md from each project and extract:
- Main purpose/description
- Installation method
- Key features
- Primary use case

Create a summary table.
```

---

## 📊 Refinement Prompts

### Prompt 8: Dependency Analysis
```
Analyze the dependencies. Do any of these projects depend on each other?
Which ones could work together in an integrated system?
```

### Prompt 9: Architecture Pattern
```
What architectural patterns does each project use?
(e.g., microservices, monolith, distributed, etc)
Update the diagram to show the patterns.
```

### Prompt 10: Layer Stack
```
Organize these projects into layers:
- Infrastructure/Platform Layer
- Runtime/Execution Layer  
- Application Layer
- Development Tools Layer

Show each project in its appropriate layer.
```

---

## 🎨 Visual Refinement Prompts

### Prompt 11: Color Coding
```
Update the diagram to use colors:
- Green for projects written in Go
- Blue for JavaScript/TypeScript
- Orange for Python
- Red for C++
Show the language distribution.
```

### Prompt 12: Relationship Diagram
```
Create a simplified diagram showing just the relationships:
- Which projects are foundational (others build on them)?
- Which are complementary?
- Which solve different problems?
```

### Prompt 13: Feature Matrix
```
Create a comparison matrix showing:
- Project name
- Primary language
- Main purpose
- Learning curve (simple/moderate/complex)
- Community size (small/medium/large)
```

---

## 🔬 Deep Dive Prompts

### Prompt 14: API Analysis
```
Search for API definitions, interfaces, or contracts in these projects:
- gRPC definitions (.proto files)
- OpenAPI/Swagger specs
- GraphQL schemas
- REST API documentation

Which projects expose APIs for external use?
```

### Prompt 15: Extensibility
```
Which projects are designed to be extended or integrated with other systems?
What extension mechanisms do they provide?
(plugins, hooks, APIs, etc)
```

### Prompt 16: Performance Characteristics
```
Search the documentation and code for performance characteristics:
- Throughput
- Latency
- Scalability approach
- Resource usage

Create a comparison chart.
```

---

## 🏗️ System Design Prompts

### Prompt 17: Microservices System
```
Imagine building a modern microservices system. 
Which of these projects would you use as foundation components?
Create an architecture diagram showing how they'd fit together.
```

### Prompt 18: Development Stack
```
If you were starting a new full-stack project, which of these 
would you use and in what order? Create a deployment diagram.
```

### Prompt 19: Learning Path
```
If someone wanted to learn about distributed systems, 
what order would you recommend studying these projects?
Which builds foundational knowledge for the others?
```

---

## 💡 Analysis Prompts

### Prompt 20: Trade-offs
```
Analyze and compare the different approaches these projects take:
- Complexity vs functionality
- Ease of use vs power
- Performance vs maintainability

Create a trade-off matrix.
```

### Prompt 21: Problem Categories
```
Categorize these projects by the problem they solve.
Do any solve the same problem differently?
What are the trade-offs between them?
```

### Prompt 22: Maturity Assessment
```
Evaluate the maturity level of each project:
- Stability/release status
- Community activity
- Documentation quality
- Production readiness

Create a maturity assessment table.
```

---

## 🎓 Learning Prompts

### Prompt 23: Architecture Lessons
```
What key architectural decisions does each project demonstrate?
What can we learn from their designs?
Create an "architecture lessons" diagram.
```

### Prompt 24: Code Organization
```
Search the source tree to understand how each project is organized.
What organizational patterns do they use?
How do they structure their code?
```

### Prompt 25: Testing Strategy
```
Search for test files, CI/CD configs, and documentation.
What testing strategies do these projects use?
Unit, integration, e2e? Manual or automated?
```

---

## 🚀 Advanced Prompts

### Prompt 26: Integration Points
```
If you wanted to create a system using 3-4 of these projects,
where would the integration points be?
What data flows between them?
Create an integration architecture diagram.
```

### Prompt 27: Ecosystem Map
```
Create a map showing how these projects relate to the broader ecosystem:
- Are they part of a larger framework/platform?
- Do they integrate with other major projects?
- What roles do they play in the tech landscape?
```

### Prompt 28: Future Evolution
```
Based on the current architecture and design,
what would be logical next steps for each project?
Create an "projected evolution" diagram.
```

---

## Tips for Best Results

1. **Be Specific**: Tell the model what you want (diagram, table, list)
2. **Ask for Evidence**: Say "show me the evidence" to verify claims
3. **Start Simple**: Begin with basic questions before complex analysis
4. **Iterate**: Refine diagrams through follow-up questions
5. **Verify**: Ask the model to search for proof of its claims

---

## Default Demo Repos

The demo includes these open source projects:
- `vercel/next.js` - React framework
- `nodejs/node` - JavaScript runtime
- `kubernetes/kubernetes` - Container orchestration
- `prometheus/prometheus` - Monitoring
- `docker/cli` - Container platform
- `apache/kafka` - Message broker
- `hashicorp/terraform` - Infrastructure as code
- `grpc/grpc` - RPC framework
- `elastic/elasticsearch` - Search engine
- `etcd-io/etcd` - Distributed consensus

All are public repos, so these prompts work immediately!

---

## Try It Now!

1. Go to http://localhost:3000
2. Click "Demo Blueprint"
3. Copy one of the prompts above
4. See what the AI generates!

Each prompt is designed to work with the default demo repos.
