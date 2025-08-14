import React from "react";
import { motion } from "framer-motion";
import { FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJs } from "react-icons/fa";
import { SiTailwindcss, SiFirebase, SiMongodb, SiExpress, SiDaisyui, SiStripe } from "react-icons/si";

const techLogos = [
  { icon: <FaReact size={50} className="text-primary" />, name: "React" },
  { icon: <FaNodeJs size={50} className="text-success" />, name: "Node.js" },
  { icon: <SiExpress size={50} className="text-gray-600" />, name: "Express" },
  { icon: <SiMongodb size={50} className="text-success" />, name: "MongoDB" },
  { icon: <SiFirebase size={50} className="text-warning" />, name: "Firebase" },
  { icon: <SiStripe size={50} className="text-info" />, name: "Stripe" },
  { icon: <SiTailwindcss size={50} className="text-secondary" />, name: "Tailwind" },
  { icon: <SiDaisyui size={50} className="text-accent" />, name: "DaisyUI" },
  { icon: <FaHtml5 size={50} className="text-error" />, name: "HTML" },
  { icon: <FaCss3Alt size={50} className="text-info" />, name: "CSS" },
  { icon: <FaJs size={50} className="text-accent" />, name: "JavaScript" },
];

const Skills = () => {
  return (
    <section className="py-16 bg-base-100 dark:bg-base-100 font-roboto-mono relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:to-secondary/20 pointer-events-none"></div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center mb-8 text-primary dark:text-primary">
          My Skills
        </h2>
        <p className="text-center text-warning mb-12">
          Technologies and tools I work with regularly
        </p>

        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {techLogos.concat(techLogos).map((tech, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center justify-center"
              whileHover={{ scale: 1.2 }}
            >
              {tech.icon}
              <span className="text-sm mt-2 text-warning">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
