import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroSection: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // Sample newly arrived furniture data
  const newlyArrivedFurniture = [
    {
      name: "Modern Sofa",
      description: "A sleek and comfortable modern sofa for your living room.",
      imageUrl:
        "/images/modern_sofa.jpeg", // Replace with the actual image URL
    },
    {
      name: "Wooden Coffee Table",
      description: "A stylish wooden coffee table with a minimalist design.",
      imageUrl:
      
        "/images/LinnCoffeeTableLifestyle1.jpg", // Replace with the actual image URL
    },
    {
      name: "Dining Chair Set",
      description: "A set of 4 elegant dining chairs made of premium wood.",
      imageUrl:
        "/images/chair.jpg", // Replace with the actual image URL
    },
  ];

  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const handleImageError = (index: number) => {
    setImageErrors((prevErrors) => ({ ...prevErrors, [index]: true }));
  };

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-32 px-6 text-center"
      style={{
        backgroundImage: `url('https://static.vecteezy.com/system/resources/thumbnails/035/209/885/small_2x/ai-generated-cozy-green-armchair-on-empty-soft-green-wall-background-in-minimalist-the-living-room-3d-render-illustration-with-copy-space-photo.jpg')`, // Replace with your hero image URL
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1
          className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight"
          data-aos="fade-up"
        >
          Discover Our{" "}
          <span className="text-yellow-400">Newly Arrived Furniture</span>
        </h1>
        <p
          className="text-base sm:text-lg lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Explore our latest collection of furniture designed to elevate any
          space. Find the perfect pieces for your home, office, or event.
        </p>

        {/* Furniture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mt-12">
          {newlyArrivedFurniture.map((furniture, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 p-6"
              data-aos="fade-up"
              data-aos-delay={`${200 + index * 200}`}
            >
              <img
                src={
                  imageErrors[index]
                    ? "https://via.placeholder.com/300x200?text=Image+Not+Available"
                    : furniture.imageUrl
                }
                alt={furniture.name}
                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-6"
                onError={() => handleImageError(index)}
              />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
                {furniture.name}
              </h3>
              <p className="text-sm sm:text-base text-white">
                {furniture.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;