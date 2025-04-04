import React, { useEffect, useState } from 'react';
import '../../App.css';
import Cards from '../Cards';
import HeroSection from '../HeroSection';
import Footer from '../Footer';
import { fetchWelcomeMessage } from "../services/api";

function Home() {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  useEffect(() => {
    fetchWelcomeMessage()
      .then((data) => {
        setWelcomeMessage(data.message);
      })
      .catch((error) => {
        console.error("Error fetching welcome message:", error);
      });
  }, []);

  return (
    <>
      <HeroSection />
      <Cards />
      <Footer />
    </>
  );
}

export default Home;