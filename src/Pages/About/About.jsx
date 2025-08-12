import { motion } from "framer-motion";

const About = () => {
  return (
    <section
      id="about"
      className="relative py-20 px-6 lg:px-20 font-roboto-mono overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:to-secondary/20 pointer-events-none"></div>

      <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
        {/* Left - Image */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary">
            <img
              src="https://i.ibb.co.com/dsnnsyjb/white-Photoroom.webp"
              alt="Mehraj Hasan Riaj"
              className="object-cover w-full "
            />
            {/* Floating gradient shapes */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-secondary/30 rounded-full blur-2xl"></div>
          </div>
        </motion.div>

        {/* Right - Content */}
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            About Me
          </h2>
          <p className="text-warning mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            I’m Mehraj Hasan Riaj, a passionate MERN Stack Developer who loves
            crafting beautiful, functional, and user-friendly web applications.
            I focus on creating responsive designs, clean code, and seamless
            user experiences.
          </p>

          {/* Skills */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {[
              "React.js",
              "Node.js",
              "Express.js",
              "MongoDB",
              "JavaScript",
              "Tailwind CSS",
              "DaisyUI",
            ].map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-content rounded-full border border-primary/30 text-sm font-medium hover:bg-primary hover:text-white transition duration-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
