import React from "react";
import { motion } from "framer-motion";

const educationList = [
  {
    degree: "B.Sc. in Computer Science",
    institution: "International Islamic University Chittagong",
    duration: "2023 - Present",
  },
  {
    degree: "Higher Secondary Certificate (HSC)",
    institution: "South Asian College Chittagong",
    duration: "2019 - 2021",
  },
  {
    degree: "Secondary School Certificate (SSC)",
    institution: "Kalauzan Sukchari Goursundar Institute",
    duration: "2017 - 2018",
  },
];

const Education = () => {
  return (
    <section className="relative py-16 bg-base-100 dark:bg-base-100 font-roboto-mono">
      {/* Gradient overlay like other sections */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:to-secondary/20 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary dark:text-primary">
          Education
        </h2>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {educationList.map((edu, index) => (
            <motion.div
              key={index}
              className="bg-base-100 dark:bg-base-100 rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
              whileInView={{ opacity: [0, 1], y: [50, 0] }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-2 text-primary dark:text-primary">
                {edu.degree}
              </h3>
              <p className="text-warning mb-1">
                {edu.institution}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                {edu.duration}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
