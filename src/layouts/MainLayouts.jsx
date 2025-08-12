import React from "react";
import Home from "../Pages/Home/Home";
import Navbar from "../Pages/Navbar";
import About from "../Pages/About/About";

const MainLayouts = () => {
  return (
    <div className="font-roboto-mono">
      <Navbar></Navbar>
      <main className="max-w-11/12 mx-auto my-6">
        <section id="home">
          <Home />
        </section>
        <section id="about" className="my-6">
          <About></About>
        </section>
        {/* <section id="projects">
          <Projects />
        </section>
        <section id="contact">
          <Contact />
        </section> */}
      </main>
    </div>
  );
};

export default MainLayouts;
