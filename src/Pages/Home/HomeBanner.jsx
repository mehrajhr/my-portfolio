import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import resume from "../../assets/Mehraj hasan riaj.pdf";
import { FiFileText } from "react-icons/fi";

const HomeBanner = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col-reverse md:flex-row items-center justify-center px-6 lg:px-20 font-roboto-mono overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 dark:from-primary/30 dark:to-secondary/30 pointer-events-none"></div>

      {/* Left Content */}
      <motion.div
        className="flex-1 text-center md:text-left z-10"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Hi,I’m <br />
          <span className="text-primary">Mehraj Hasan Riaj</span>
        </h1>

        <TypeAnimation
          sequence={[
            "MERN Stack Developer 💻",
            2000,
            "React Enthusiast ⚛️",
            2000,
            "UI/UX Learner 🎨",
            2000,
          ]}
          wrapper="span"
          speed={50}
          repeat={Infinity}
          className="block text-xl md:text-2xl text-primary mb-6"
        />

        <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8">
          Passionate about building beautiful, responsive, and user-friendly web
          applications.
        </p>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <a
            href="https://github.com/mehrajhr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-700 transition dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            <FaGithub size={20} /> GitHub
          </a>

          <a
            href="https://linkedin.com/in/mehraj-hr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-500 transition"
          >
            <FaLinkedin size={20} /> LinkedIn
          </a>

          <a
            href="mailto:mehrajhasanriajcse@gmail.com"
            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-400 transition"
          >
            <FaEnvelope size={20} /> Email
          </a>

          <a
            href={resume}
            download="Mehraj_Hasan_Riaj_Resume.pdf"
            className="flex items-center gap-2 bg-primary text-error px-5 py-2 rounded-lg shadow hover:bg-secondary transition"
          >
            <FiFileText></FiFileText>
            Get Resume
          </a>
        </div>
      </motion.div>

      {/* Right Image */}
      <motion.div
        className="flex-1 flex justify-center z-10 relative"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-primary shadow-xl">
          <img
            src="https://i.ibb.co.com/SwMCqgx8/transparent-Photoroom.jpg"
            alt="Mehraj Hasan Riaj"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Floating Gradient Shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
      </motion.div>
    </section>
  );
};

export default HomeBanner;
