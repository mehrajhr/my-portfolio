import React from "react";
import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaGithub,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  SiTailwindcss,
  SiFirebase,
  SiMongodb,
  SiExpress,
  SiDaisyui,
  SiStripe,
} from "react-icons/si";

const techIcons = {
  React: <FaReact className="text-primary" />,
  "Node.js": <FaNodeJs className="text-success" />,
  Express: <SiExpress className="text-gray-600" />,
  MongoDB: <SiMongodb className="text-success" />,
  Firebase: <SiFirebase className="text-warning" />,
  Stripe: <SiStripe className="text-info" />,
  HTML: <FaHtml5 className="text-error" />,
  CSS: <FaCss3Alt className="text-info" />,
  JavaScript: <FaJs className="text-accent" />,
  Tailwind: <SiTailwindcss className="text-secondary" />,
  DaisyUI: <SiDaisyui className="text-accent" />,
};

const projects = [
  {
    title: "Knowloop",
    description:
      "Collaborative study platform connecting students and tutors with session scheduling, material sharing, and payment integration.",
    img: "https://i.ibb.co.com/CKMdpx8w/image.png",
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "Firebase",
      "Tailwind",
      "DaisyUI",
      "Stripe",
    ],
    live: "https://know-loop.web.app/",
    github: "https://github.com/mehrajhr/knowloop-client",
  },
  {
    title: "FitArena",
    description:
      "A sports event booking platform connecting athletes and enthusiasts with local events.",
    img: "https://i.ibb.co.com/pBSQ3Wvy/image.png",
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "Firebase",
      "Tailwind",
      "DaisyUI",
    ],
    live: "https://fit-arena-6de23.web.app/",
    github: "https://github.com/mehrajhr/fitarena-client-side",
  },
  {
    title: "Zaffro",
    description:
      "Zaffro, A full-stack e-commerce platform for an online clothing brand, featuring product management, secure checkout, inventory control, and a responsive shopping experience.",
    img: "https://i.ibb.co.com/Gfh5MWjY/Screenshot-2025-10-09-020018.png",
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "Firebase",
      "Tailwind",
      "DaisyUI",
    ],
    live: "https://zaffro.netlify.app/",
    github: "https://github.com/mehrajhr/zaffro-client",
  },
  {
    title: "Phudu",
    description:
      "Frontend-only doctor booking website with responsive UI and interactive appointment scheduling.",
    img: "https://i.ibb.co.com/gb18xhVV/image.png",
    tech: ["HTML", "Tailwind", "DaisyUI", "React"],
    live: "https://dapper-khapse-a3de51.netlify.app/",
    github: "https://github.com/mehrajhr/phudu-doctor-appointement-booking",
  },
  {
    title: "English Janala",
    description:
      "Interactive English vocabulary learning platform built using JS, HTML, Tailwind, and DaisyUI.",
    img: "https://i.ibb.co.com/MkmYYZw4/image.png",
    tech: ["HTML", "Tailwind", "DaisyUI", "JavaScript"],
    live: "https://statuesque-tanuki-4d2bf8.netlify.app/#vocabulariesBtns",
    github: "https://github.com/mehrajhr/english-janala",
  },
];

const Projects = () => {
  return (
    <section className="relative py-16 bg-base-100 dark:bg-base-100 font-roboto-mono">
      {/* Gradient Overlay like About Section */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:to-secondary/20 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary dark:text-primary">
          Projects
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-base-100 dark:bg-base-100 rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
              whileInView={{ opacity: [0, 1], y: [50, 0] }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <img
                src={project.img}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-2xl font-semibold mb-2 text-primary dark:text-primary">
                  {project.title}
                </h3>
                <p className="text-warning mb-4 flex-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-xs font-medium bg-base-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-100"
                    >
                      {techIcons[tech]} {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex gap-3">
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-base-100 rounded-lg hover:bg-secondary transition text-sm font-medium"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-base-100 rounded-lg hover:bg-primary transition text-sm font-medium"
                  >
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
