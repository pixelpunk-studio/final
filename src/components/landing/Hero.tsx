import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden"
      role="banner"
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <h1
          className={`text-6xl md:text-8xl font-bold mb-6 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          PixelPunk Studio
        </h1>
        <p
          className={`text-2xl md:text-4xl mb-12 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          Design that hits different
        </p>
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <button
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform duration-150"
            aria-label="View our services"
          >
            Explore Services
          </button>
          <button
            onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border-2 border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
            aria-label="View our portfolio"
          >
            See Our Work
          </button>
        </div>
      </div>
    </section>
  );
}
