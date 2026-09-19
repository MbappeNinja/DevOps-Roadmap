/* ========================================
   DevOps Mastery — Interactive Roadmap Logic
   ======================================== */

// ========================================
// Data Structure
// ========================================
const TOPICS = {
    linux: {
        concepts: ['linux-filesystem', 'linux-permissions', 'linux-processes', 'linux-networking', 'linux-shell-scripting', 'linux-text-processing'],
        total: 6
    },
    git: {
        concepts: ['git-basics', 'git-branching', 'git-workflows', 'git-advanced', 'git-hooks'],
        total: 5
    },
    docker: {
        concepts: ['docker-basics', 'docker-dockerfile', 'docker-compose', 'docker-volumes', 'docker-registry', 'docker-security'],
        total: 6
    },
    cicd: {
        concepts: ['cicd-concepts', 'cicd-github-actions', 'cicd-jenkins', 'cicd-testing', 'cicd-artifacts'],
        total: 5
    },
    k8s: {
        concepts: ['k8s-architecture', 'k8s-pods', 'k8s-kubectl', 'k8s-config', 'k8s-helm'],
        total: 5
    },
    cloud: {
        concepts: ['cloud-basics', 'cloud-compute', 'cloud-storage', 'cloud-networking', 'cloud-iam'],
        total: 5
    },
    iac: {
        concepts: ['iac-concepts', 'iac-terraform', 'iac-ansible', 'iac-state', 'iac-modules'],
        total: 5
    },
    monitoring: {
        concepts: ['monitoring-pillars', 'monitoring-prometheus', 'monitoring-elk', 'monitoring-alerting', 'monitoring-sre'],
        total: 5
    }
};

// ========================================
// State Management
// ========================================
const STORAGE_KEY = 'devops-roadmap-progress';

function loadProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn('Could not save progress:', e);
    }
}

let progress = loadProgress();

// ========================================
// Topic Toggle (Expand/Collapse)
// ========================================
function toggleTopic(topicId) {
    const body = document.getElementById(`body-${topicId}`);
    const chevron = document.getElementById(`chevron-${topicId}`);

    if (!body || !chevron) return;

    const isOpen = body.classList.contains('open');

    if (isOpen) {
        body.classList.remove('open');
        chevron.classList.remove('open');
    } else {
        body.classList.add('open');
        chevron.classList.add('open');
    }
}

// ========================================
// Concept Toggle (Checkbox)
// ========================================
function toggleConcept(topicId, conceptId) {
    if (!progress[topicId]) {
        progress[topicId] = {};
    }

    progress[topicId][conceptId] = !progress[topicId][conceptId];
    saveProgress(progress);

    // Update the concept item styling
    const conceptItem = document.querySelector(`.concept-item[data-concept="${conceptId}"]`);
    if (conceptItem) {
        if (progress[topicId][conceptId]) {
            conceptItem.classList.add('completed');
            triggerConfetti(conceptItem);
        } else {
            conceptItem.classList.remove('completed');
        }
    }

    updateTopicProgress(topicId);
    updateOverallProgress();
}

// ========================================
// Progress Updates
// ========================================
function updateTopicProgress(topicId) {
    const topic = TOPICS[topicId];
    if (!topic) return;

    const completed = topic.concepts.filter(c => progress[topicId]?.[c]).length;
    const total = topic.total;

    // Update progress text
    const progressEl = document.getElementById(`progress-${topicId}`);
    if (progressEl) {
        progressEl.textContent = `${completed}/${total}`;
    }

    // Update node status
    const node = document.getElementById(`topic-${topicId}`);
    if (node) {
        node.classList.remove('completed', 'in-progress');
        if (completed === total) {
            node.classList.add('completed');
        } else if (completed > 0) {
            node.classList.add('in-progress');
        }
    }
}

function updateOverallProgress() {
    let totalConcepts = 0;
    let completedConcepts = 0;

    for (const [topicId, topic] of Object.entries(TOPICS)) {
        totalConcepts += topic.total;
        completedConcepts += topic.concepts.filter(c => progress[topicId]?.[c]).length;
    }

    const percentage = Math.round((completedConcepts / totalConcepts) * 100);

    // Update ring
    const ringFill = document.getElementById('ringFill');
    if (ringFill) {
        const circumference = 106.8; // 2 * π * 17
        const offset = circumference - (percentage / 100) * circumference;
        ringFill.style.strokeDashoffset = offset;
    }

    // Update ring text
    const ringText = document.getElementById('ringText');
    if (ringText) {
        ringText.textContent = `${percentage}%`;
    }

    // Update stats
    const statCompleted = document.getElementById('statCompleted');
    if (statCompleted) {
        statCompleted.textContent = completedConcepts;
    }
}

// ========================================
// Filter System
// ========================================
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    const nodes = document.querySelectorAll('.topic-node');

    nodes.forEach(node => {
        const topicId = node.dataset.topic;
        const topic = TOPICS[topicId];
        const completed = topic.concepts.filter(c => progress[topicId]?.[c]).length;
        const total = topic.total;

        let show = true;

        switch (filter) {
            case 'completed':
                show = completed === total;
                break;
            case 'in-progress':
                show = completed > 0 && completed < total;
                break;
            case 'not-started':
                show = completed === 0;
                break;
            default:
                show = true;
        }

        if (show) {
            node.classList.remove('hidden');
        } else {
            node.classList.add('hidden');
        }
    });
}

// ========================================
// Mini Confetti Effect
// ========================================
function triggerConfetti(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#34d399', '#6366f1', '#22d3ee', '#fbbf24', '#fb7185', '#a78bfa'];

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 6 + 4}px;
            height: ${Math.random() * 6 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            left: ${rect.left + 20}px;
            top: ${rect.top + 10}px;
            pointer-events: none;
            z-index: 1000;
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.left = `${rect.left + 20 + (Math.random() - 0.5) * 160}px`;
            particle.style.top = `${rect.top + 10 - Math.random() * 100 - 20}px`;
            particle.style.opacity = '0';
            particle.style.transform = `rotate(${Math.random() * 360}deg) scale(0)`;
        });

        setTimeout(() => particle.remove(), 900);
    }
}

// ========================================
// Background Particles
// ========================================
function createBackgroundParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;

    const colors = [
        'rgba(99, 102, 241, 0.15)',
        'rgba(139, 92, 246, 0.12)',
        'rgba(6, 182, 212, 0.1)',
        'rgba(52, 211, 153, 0.08)'
    ];

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 1;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration: ${Math.random() * 20 + 15}s;
            animation-delay: ${Math.random() * 20}s;
        `;
        container.appendChild(particle);
    }
}

// ========================================
// Restore Saved Progress
// ========================================
function restoreProgress() {
    for (const [topicId, topic] of Object.entries(TOPICS)) {
        if (!progress[topicId]) continue;

        for (const conceptId of topic.concepts) {
            if (progress[topicId][conceptId]) {
                // Check the checkbox
                const conceptItem = document.querySelector(`.concept-item[data-concept="${conceptId}"]`);
                if (conceptItem) {
                    const checkbox = conceptItem.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = true;
                    conceptItem.classList.add('completed');
                }
            }
        }

        updateTopicProgress(topicId);
    }

    updateOverallProgress();
}

// ========================================
// Intersection Observer for Animations
// ========================================
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.topic-node').forEach(node => {
        observer.observe(node);
    });
}

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    createBackgroundParticles();
    restoreProgress();
    setupFilters();
    setupScrollAnimations();

    // Count total concepts for the stats
    let totalConcepts = 0;
    for (const topic of Object.values(TOPICS)) {
        totalConcepts += topic.total;
    }
    const statLessons = document.getElementById('statLessons');
    if (statLessons) {
        statLessons.textContent = totalConcepts;
    }
});
