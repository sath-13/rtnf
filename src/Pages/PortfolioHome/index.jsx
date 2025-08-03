import React, { useState } from "react";
import { HeroBanner, ContentPage } from "../../components";
import "./style.css";

const PortfolioHome = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="scroll-container">
      <section className="scroll-section">
        <HeroBanner onSearch={handleSearch} />
      </section>
      <section className="scroll-section">
        <ContentPage initialSearchTerm={searchTerm} />
      </section>
    </div>
  );
};

export default PortfolioHome;