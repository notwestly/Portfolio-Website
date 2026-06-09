/* ══════════════════════════════════════════════════
   PORTFOLIO DATA  —  js/data.js
   Single source of truth for all portfolio content.
   Plain global — load this before terminalgui.js.
══════════════════════════════════════════════════ */
const PORTFOLIO_DATA = {

    profile: {
        name:     'Jhon Westly A. Carmelotes',
        role:     'Software Engineer',
        location: 'Philippines',
        status:   'Open to opportunities',
        bio: [
            'Full-stack Software Engineer based in the Philippines.',
            '21 months exp. at Amdocs; Junior→SE in 6 months · 14 deployments'
        ]
    },

    contact: {
        emails:   ['westlycarmelotes@gmail.com', 'mewestly@gmail.com'],
        phone:    '+63 915 511 2210',
        github:   'github.com/notwestly',
        linkedin: 'linkedin.com/in/jhon-westly-a-carmelotes',
        location: 'Philippines'
    },

    skills: {
        languages:     ['C#', 'PHP', 'JavaScript', 'SQL', 'Python', 'C++', 'Java', 'HTML', 'CSS'],
        frameworks:    ['.NET', 'Laravel', 'React.js', 'Bootstrap', 'jQuery', 'WordPress', 'REST APIs', 'Node.js'],
        cloud:         ['AWS (EKS, S3, CloudWatch, Beanstalk)', 'Kubernetes', 'CI/CD Pipelines', 'Cloud Migration', 'Git'],
        testing:       ['Selenium', 'Postman', 'UI Automation', 'Manual Testing'],
        methodologies: ['Agile / Scrum', 'SDLC', 'ORM & Query Optimization', 'Database Design', 'Lean Six Sigma']
    },

    experience: [
        {
            title:   'Software Engineer',
            company: 'Amdocs',
            period:  'Jan 2025 – Mar 2026',
            bullets: [
                'Full-stack delivery end-to-end within a 36 man-day deadline',
                'Backend: .NET, C#, PHP, SQL, JavaScript across concurrent projects',
                'Mentored 2 engineers · 11 production deployments shipped'
            ]
        },
        {
            title:   'Junior Software Engineer',
            company: 'Amdocs',
            period:  'Jun 2024 – Dec 2024',
            bullets: [
                'Cloud migration of legacy components to core AWS services',
                'Participated in 2 cloud migration deployments · 1 production release'
            ]
        },
        {
            title:   'Full Stack Web Dev Bootcamp',
            company: 'Village88',
            period:  'Jan 2023 – Apr 2023',
            bullets: [
                '16-week bootcamp · HTML, CSS, JS, PHP, CodeIgniter, MySQL',
                'Best in Capstone for QA using Selenium automation'
            ]
        }
    ],

    certifications: [
        { name: 'Agentic Development using Cursor',     issuer: 'AGS AImpower · Amdocs CBS PSU', year: '2026' },
        { name: 'Project Management Fundamentals MOOC', issuer: 'Amdocs',                        year: '2025' },
        { name: 'Agile & Scaled Agile Fundamentals',    issuer: 'Amdocs',                        year: '2025' },
        { name: 'ASEAN Youth for Digital Action',       issuer: 'AYDA / AWS re/Start',            year: '2025' },
        { name: 'AWS re/Start Program',                 issuer: 'AWS · EDK',                     year: '2024' },
        { name: 'Lean Six Sigma Yellow Belt',           issuer: 'Elevate Six Sigma',              year: '2023' },
        { name: 'Best Presenter',                       issuer: 'Elevate Six Sigma',              year: '2023' },
        { name: 'Certificate of Completion',            issuer: 'Village88',                      year: '2023' },
        { name: 'Best Capstone in QA',                  issuer: 'Village88',                      year: '2023' }
    ],

    projects: [
        {
            name:   'RAG Document Chat',
            status: 'In Development',
            stack:  ['Python', 'FastAPI', 'React', 'Tailwind', 'Claude API', 'Voyage AI', 'pgvector', 'Supabase'],
            desc:   'Upload any PDF and chat with it using natural language. Chunks are embedded via Voyage AI, stored in pgvector, and retrieved with reranking before Claude streams a response.',
            repo:   'github.com/notwestly/RAG-Project',
            demo:   'rag.jhestly.com'
        }
    ],

    resume: 'assets/Resumes/Jhon%20Westly%20A.%20Carmelotes%20Resume.pdf'
};
