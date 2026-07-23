(function () {
  const chatRoot = document.querySelector("[data-chatbot]");
  const scenarios = {
    matching: {
      title: "Lead matching",
      phase: "Advisory",
      message:
        "Start with one high-friction matching workflow. I would map candidate signals, recruiter demand, freshness, consent, and token cost before building. The first agent should recommend and explain, not auto-push uncertain matches.",
      route: "Candidate signals -> recruiter demand -> policy rules -> explainable recommendation",
      guardrail: "No automated match push without consent, eligibility checks, and human review for uncertain cases.",
      metric: "Token cost per useful match, acceptance rate, missed leads, recruiter response time.",
      nextStep: "Define the smallest matching workflow and create eval cases from real recruiter logs.",
    },
    support: {
      title: "Recruiter support",
      phase: "Onsite implementation",
      message:
        "For repeated recruiter questions, I would build a KB-backed support agent with cited answers, issue classification, escalation, and unresolved-question capture. The goal is faster onboarding without hiding product gaps.",
      route: "KB retrieval -> issue classification -> account/job-post state -> support ticket escalation",
      guardrail: "No account-specific or policy-sensitive answer without source citation and escalation path.",
      metric: "Onboarding time, support deflection, issue resolution time, escalation quality.",
      nextStep: "Map repeated recruiter questions to source-of-truth answers and support owners.",
    },
    card: {
      title: "Risky action",
      phase: "Guarded rollout",
      message:
        "For a state-changing action, the agent must prove identity, check policy, create an audit trail, and escalate when confidence is incomplete. Wonderful's value is not only fast build speed; it is enterprise-grade control at deployment time.",
      route: "Identity proofing -> 2FA -> controlled API -> compliance log -> human escalation",
      guardrail: "Zero unauthorized state-changing actions; escalate if identity confidence is incomplete.",
      metric: "Containment under 2 minutes with 0 unsafe mutations.",
      nextStep: "Validate auth step-up, audit logging, rollback, and live trace review before pilot.",
    },
  };

  const diagnosticRules = {
    matching: {
      workflow: "AI lead-matching copilot",
      route: "CRM/job demand -> candidate signals -> ranker -> explanation -> recruiter action",
      guardrail: "Human approval for uncertain matches, consent checks, and token budget by candidate segment.",
      metric: "Useful match rate, token cost per accepted lead, missed lead count, recruiter response time.",
      next: "Pilot one segment with known job demand and build evals from accepted/rejected matches.",
    },
    support: {
      workflow: "Recruiter support and onboarding agent",
      route: "Knowledge base -> issue classifier -> account state -> ticket handoff -> product feedback loop",
      guardrail: "Cited answers only; account-specific actions require auth and escalation.",
      metric: "Onboarding time, support deflection, unresolved-question backlog, escalation quality.",
      next: "Collect top 30 repeated questions and turn them into a governed KB with owner review.",
    },
    operations: {
      workflow: "Internal operations workflow agent",
      route: "Ops request -> policy lookup -> tool proposal -> approval -> audit trail",
      guardrail: "Approval required before business-critical updates or cross-system writes.",
      metric: "Manual handling time, error rate, approval latency, rollback count.",
      next: "Choose one repetitive workflow and document every system it touches before automation.",
    },
    compliance: {
      workflow: "Governed enterprise action agent",
      route: "Identity -> policy engine -> least-privilege tool call -> audit log -> compliance review",
      guardrail: "No write action without identity confidence, permission scope, and traceable approval.",
      metric: "Unsafe action rate, audit completeness, policy violation rate, mean time to containment.",
      next: "Start with read-only recommendations, then graduate specific actions behind approval gates.",
    },
  };

  const concepts = {
    advisory: {
      engineer:
        "Turn a vague customer request into system boundaries: users, tools, data freshness, auth, risk, failure mode, and measurable outcome.",
      business:
        "Pick the first workflow that creates visible value quickly instead of trying to transform everything at once.",
      wonderful:
        "This maps to Wonderful's first motion: understand the enterprise workflow before committing implementation scope.",
    },
    onsite: {
      engineer:
        "Build inside the client's real environment: API contracts, data mapping, policy checks, logging, fallback, and eval traces.",
      business:
        "Make the agent useful in the place work actually happens, with the client's team seeing how it behaves.",
      wonderful:
        "This is the FDE bridge: platform capability plus local integration and client-specific requirements.",
    },
    platform: {
      engineer:
        "Package the workflow so the client can operate more agents later: reusable patterns, evals, prompts, tool contracts, and dashboards.",
      business:
        "The client should own transformation after launch, not wait for every future change to become a consulting project.",
      wonderful:
        "This reflects Wonderful's platform promise: fast deployment plus enterprise governance at scale.",
    },
    governance: {
      engineer:
        "Treat identity, permission, audit log, rollback, and human escalation as product requirements, not compliance paperwork.",
      business:
        "Enterprise agents are trusted when leaders can see what happened, why it happened, and who approved risky actions.",
      wonderful:
        "This is where enterprise-grade agent builders separate from generic chatbots.",
    },
    tokens: {
      engineer:
        "Reduce waste with retrieval, pre-filtering, structured outputs, caching, batching, and evals tied to business usefulness.",
      business:
        "AI quality is not enough. A deployment must make economic sense when real users create real volume.",
      wonderful:
        "This is where my Zalo matching work supports Wonderful's enterprise deployment economics.",
    },
  };

  const stakeholders = {
    cto: {
      questions:
        "Which systems are source of truth? What APIs are stable enough for pilot? What auth and audit model already exists? Where do failures go today?",
      proof:
        "Use Zalo-scale production, partner integrations, ZNS/business messaging, and SOX-aware reporting work as credibility signals.",
      objection:
        "If they ask about risk: start read-only, add eval gates, expose traces, and promote only one action at a time.",
    },
    business: {
      questions:
        "Which workflow is painful enough to sponsor? What metric would make the pilot undeniable? Who owns the decision after launch?",
      proof:
        "Use Job Market workflow automation, 30% overhead reduction, 40% faster onboarding, and recruiter/support context.",
      objection:
        "If they ask about ROI: tie deployment to handling time, missed leads, conversion, onboarding speed, and support volume.",
    },
    ops: {
      questions:
        "What is repeated every day? Which edge cases force manual handling? What does a good escalation look like?",
      proof:
        "Use internal stakeholder work with product, sales, operations, and engineering as the FDE operating pattern.",
      objection:
        "If they fear replacement: position the agent as workflow leverage that captures unresolved issues and escalates cleanly.",
    },
    people: {
      questions:
        "What did the first interview expose? What story should be told tighter? Which role concern should be reframed?",
      proof:
        "Use the corrected STAR stories: AI matching cost, recruiter onboarding, operations automation, and team promotion.",
      objection:
        "If they question client-facing strength: say sales owns pipeline; I help technical conviction, scope, and safe deployment in the customer room.",
    },
  };

  function text(selector, value, root = document) {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  }

  function appendMessage(role, value) {
    const log = document.querySelector("[data-chat-log]");
    if (!log) return;
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${role}`;
    const speaker = role === "user" ? "You" : "FDE Bot";
    bubble.innerHTML = `<b>${speaker}</b>${escapeHtml(value)}`;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function updateReadout(payload) {
    text("[data-chat-phase]", payload.phase || "Advisory");
    text("[data-chat-route]", payload.toolRoute || payload.route);
    text("[data-chat-guardrail]", payload.guardrail);
    text("[data-chat-metric]", payload.metric);
  }

  function activeScenario() {
    return document.querySelector("[data-scenario-choice].is-active")?.dataset.scenarioChoice || "matching";
  }

  function localWorkflowReply(message) {
    const key = activeScenario();
    const scenario = scenarios[key] || scenarios.matching;
    const lower = String(message || "").toLowerCase();
    let phase = scenario.phase;
    let reply = scenario.message;
    let nextStep = scenario.nextStep;

    if (lower.includes("eval") || lower.includes("quality")) {
      phase = "Platform ownership";
      reply = "I would convert real logs into eval cases before tuning prompts. The point is to make quality measurable enough that the client can govern future agents, not just admire a demo.";
      nextStep = "Create a gold dataset, pass/fail rubric, and release gate.";
    } else if (lower.includes("debug") || lower.includes("fail") || lower.includes("error")) {
      phase = "Debug";
      reply = "I would inspect the trace by layer: user intent, retrieval, model output, tool request, upstream response, policy decision, and fallback. Fix the failing layer, then add an eval so it does not regress.";
      nextStep = "Replay the failed trace against a mocked tool contract.";
    } else if (lower.includes("vietnam") || lower.includes("local")) {
      phase = "Vietnam rollout";
      reply = "For Vietnam, I would prioritize workflows where local language, local operator behavior, and existing enterprise systems matter. That is exactly where a local FDE team can move faster than a remote hub.";
      nextStep = "Pick one local customer workflow and map owner, data, action, risk, and metric.";
    }

    return {
      reply,
      phase,
      toolRoute: scenario.route,
      guardrail: scenario.guardrail,
      metric: scenario.metric,
      nextStep,
      source: "local-fallback",
    };
  }

  function resetChatIntro(key) {
    const scenario = scenarios[key] || scenarios.matching;
    const log = document.querySelector("[data-chat-log]");
    if (!log) return;
    log.innerHTML = "";
    appendMessage("agent", scenario.message);
    updateReadout({
      phase: scenario.phase,
      toolRoute: scenario.route,
      guardrail: scenario.guardrail,
      metric: scenario.metric,
    });
  }

  async function submitChatMessage(message) {
    const status = document.querySelector("[data-chat-status]");
    const scenario = activeScenario();
    appendMessage("user", message);
    if (status) status.textContent = "Thinking";

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, scenario, language: "en" }),
      });
      const payload = response.ok ? await response.json() : localWorkflowReply(message);
      appendMessage("agent", payload.reply || localWorkflowReply(message).reply);
      updateReadout(payload);
    } catch (_error) {
      const payload = localWorkflowReply(message);
      appendMessage("agent", payload.reply);
      updateReadout(payload);
    } finally {
      if (status) status.textContent = "Ready";
    }
  }

  function bindChatbot() {
    if (!chatRoot) return;
    resetChatIntro(activeScenario());

    document.querySelectorAll("[data-scenario-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-scenario-choice]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        resetChatIntro(button.dataset.scenarioChoice);
      });
    });

    document.querySelectorAll("[data-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.querySelector("[data-chat-input]");
        if (input) input.value = button.dataset.prompt || "";
      });
    });

    const form = document.querySelector("[data-chat-form]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.querySelector("[data-chat-input]");
      const message = input?.value.trim();
      if (!message) return;
      input.value = "";
      submitChatMessage(message);
    });
  }

  function updateDiagnostic() {
    const root = document.querySelector("[data-diagnostic]");
    if (!root) return;

    const choices = Array.from(root.querySelectorAll("[data-diagnostic-choice].is-active")).map((button) => button.dataset.value);
    const primary = choices[0] || "matching";
    const result = diagnosticRules[primary] || diagnosticRules.matching;
    const maturity = choices[1] || "unclear";
    const risk = choices[3] || "moderate";
    const metric = choices[4] || "business";

    text("[data-result-workflow]", result.workflow);
    text("[data-result-route]", result.route);
    text("[data-result-guardrail]", result.guardrail);
    text("[data-result-metric]", result.metric);
    text(
      "[data-result-next]",
      `${result.next} Current signal: ${maturity} data, ${risk} risk, ${metric} metric focus.`
    );
  }

  function bindDiagnostic() {
    const root = document.querySelector("[data-diagnostic]");
    if (!root) return;
    root.querySelectorAll("[data-diagnostic-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest("[data-question]");
        group?.querySelectorAll("[data-diagnostic-choice]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        updateDiagnostic();
      });
    });
    updateDiagnostic();
  }

  function bindExplainer() {
    const root = document.querySelector("[data-explainer]");
    if (!root) return;

    function setConcept(key) {
      const concept = concepts[key] || concepts.advisory;
      root.querySelectorAll("[data-concept]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.concept === key);
      });
      text("[data-explain-engineer]", concept.engineer, root);
      text("[data-explain-business]", concept.business, root);
      text("[data-explain-wonderful]", concept.wonderful, root);
    }

    root.querySelectorAll("[data-concept]").forEach((button) => {
      button.addEventListener("click", () => setConcept(button.dataset.concept));
    });
    setConcept("advisory");
  }

  function bindToolkit() {
    const root = document.querySelector("[data-toolkit]");
    if (!root) return;

    function setStakeholder(key) {
      const item = stakeholders[key] || stakeholders.cto;
      root.querySelectorAll("[data-stakeholder]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.stakeholder === key);
      });
      text("[data-toolkit-questions]", item.questions, root);
      text("[data-toolkit-proof]", item.proof, root);
      text("[data-toolkit-objection]", item.objection, root);
    }

    root.querySelectorAll("[data-stakeholder]").forEach((button) => {
      button.addEventListener("click", () => setStakeholder(button.dataset.stakeholder));
    });
    setStakeholder("cto");
  }

  function sendVisitBeacon() {
    if (!document.body.hasAttribute("data-visit-beacon")) return;
    const key = "fde-workbench-session-id";
    const firstVisit = !localStorage.getItem(key);
    const sessionId =
      localStorage.getItem(key) ||
      `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(key, sessionId);

    const payload = {
      sessionId,
      firstVisit,
      referrer: document.referrer || "direct",
      landing: window.location.pathname + window.location.search,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      language: navigator.language,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
    };
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/visit", blob);
      return;
    }
    fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
      () => {}
    );
  }

  bindChatbot();
  bindDiagnostic();
  bindExplainer();
  bindToolkit();
  sendVisitBeacon();

  window.localWorkflowReply = localWorkflowReply;
  window.sendVisitBeacon = sendVisitBeacon;
})();
