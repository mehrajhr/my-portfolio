import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import { FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    emailjs
      .sendForm(
        "service_gk103pi",
        "template_kyjezac",
        form.current,
        "6leJKtI5nIIFnzndP"
      )
      .then(
        () => {
          setLoading(false);
          setSuccess("Message sent successfully!");
          setError("");
          setTimeout(() => setSuccess(""), 5000);
          e.target.reset();
        },
        (error) => {
          setLoading(false);
          setError("Failed to send message. Try again!");
          setSuccess("");
          setTimeout(() => setError(""), 5000);
        }
      );
  };

  return (
    <section className="relative py-16 bg-base-100 dark:bg-base-100 font-roboto-mono">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:to-secondary/20 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary dark:text-primary">
          Contact Me
        </h2>

        <form
          ref={form}
          onSubmit={sendEmail}
          className="bg-base-100 dark:bg-base-100 p-8 rounded-2xl shadow-md flex flex-col gap-6"
        >
          <input
            type="text"
            name="user_name"
            placeholder="Your Name"
            required
            className="input input-bordered w-full rounded-lg bg-base-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <input
            type="email"
            name="user_email"
            placeholder="Your Email"
            required
            className="input input-bordered w-full rounded-lg bg-base-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows="5"
            className="textarea textarea-bordered w-full rounded-lg bg-base-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-5 py-3 bg-primary text-base-100 rounded-lg hover:bg-secondary transition text-sm font-medium`}
          >
            {loading ? "Sending..." : "Send Message"} <FaPaperPlane />
          </button>
          {success && (
            <p
              className={`text-center mt-2 transition-opacity duration-500 ${
                success ? "opacity-100" : "opacity-0"
              } text-success`}
            >
              {success}
            </p>
          )}
          {error && <p className="text-center text-error mt-2">{error}</p>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
