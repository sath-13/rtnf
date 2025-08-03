import React, { useState, useEffect, useMemo } from 'react';
import { getAllProjects } from '../../api/projectApi';
import Projects from '../Projects';
import './styles.css';
import { FaChevronDown } from "react-icons/fa";

const ContentPage = ({ initialSearchTerm }) => {
  const [isListView] = useState(false);
  const [search, setSearch] = useState(initialSearchTerm || '');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [fetchedProjects, setFetchedProjects] = useState([]);
  const [allTags, setAllTags] = useState({
    techStack: [],
    client: [],
    teams: [],
    features: []
  });
  const [projectsPerPage, setProjectsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const newProjectsPerPage = window.innerWidth < 1017 ? 6 : 6;
      setProjectsPerPage(newProjectsPerPage);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getAllProjects(sortBy);

        if (result.success) {
          const projects = result.projects;

          const getUniqueValues = (arr) => [...new Set(arr.map(item => JSON.stringify(item)))].map(JSON.parse);

          const techStackTags = getUniqueValues(projects.flatMap((project) => project.techStack || []).filter(Boolean));
          const clientTags = getUniqueValues(projects.map((project) => project.client_id).filter(Boolean));
          const teamsTags = getUniqueValues(projects.map((project) => project.team_id).filter(Boolean));
          const featuresTags = getUniqueValues(projects.flatMap((project) => project.feature || []).filter(Boolean));

          setAllTags({
            techStack: techStackTags,
            client: clientTags,
            teams: teamsTags,
            features: featuresTags,
          });

          setFetchedProjects(projects);

          const initialTotalPages = Math.ceil(projects.length / projectsPerPage);
          setTotalPages(initialTotalPages);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sortBy, projectsPerPage]);

  const filteredProjects = useMemo(() => {
    return fetchedProjects.filter((project) => {
      const searchTerms = search.toLowerCase().split(' ');
      const matchesSearch = searchTerms.every(term =>
        (project.name && project.name.toLowerCase().includes(term)) ||
        (project.feature && Array.isArray(project.feature) && project.feature.some(f =>
          (typeof f === 'string' && f.toLowerCase().includes(term)) ||
          (f.name && f.name.toLowerCase().includes(term))
        )) ||
        (project.techStack && Array.isArray(project.techStack) && project.techStack.some(t => t && t.name && t.name.toLowerCase().includes(term))) ||
        (project.client_id && project.client_id.name && project.client_id.name.toLowerCase().includes(term)) ||
        (project.team_id && project.team_id.teamTitle && project.team_id.teamTitle.toLowerCase().includes(term))
      );

      const matchesTags = selectedTags.every(tag => {
        const tagLower = tag.toLowerCase();
        return (
          (project.techStack && Array.isArray(project.techStack) && project.techStack.some(t => (t && (t._id === tag || (t.name && t.name.toLowerCase().includes(tagLower)))))) ||
          (project.feature && Array.isArray(project.feature) && project.feature.some(f =>
            (typeof f === 'string' && f.toLowerCase().includes(tagLower)) ||
            (f._id === tag) ||
            (f.name && f.name.toLowerCase().includes(tagLower))
          )) ||
          (project.team_id && (project.team_id._id === tag || (project.team_id.teamTitle && project.team_id.teamTitle.toLowerCase().includes(tagLower)))) ||
          (project.client_id && (project.client_id._id === tag || (project.client_id.name && project.client_id.name.toLowerCase().includes(tagLower)))) ||
          (project.name && project.name.toLowerCase().includes(tagLower))
        );
      });

      return matchesSearch && matchesTags;
    });
  }, [fetchedProjects, selectedTags, search]); // Updated dependencies



  useEffect(() => {
    setSearch(initialSearchTerm || '');
    if (initialSearchTerm && !selectedTags.includes(initialSearchTerm)) {
      setSelectedTags(prevTags => [...prevTags, initialSearchTerm]);
    }
  }, [initialSearchTerm, selectedTags]);

  useEffect(() => {
    const filteredTotalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    setTotalPages(filteredTotalPages);
    setActivePage(1);
  }, [filteredProjects, projectsPerPage]);

  const startIndex = (activePage - 1) * projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) => {
      const newTags = prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
      return newTags;
    });
  };

  const removeTag = (tag) => {
    setSelectedTags(prevTags => prevTags.filter(t => t !== tag));
    setSearch(prevSearch => {
      const searchTerms = prevSearch.split(' ');
      return searchTerms.filter(term => term.toLowerCase() !== tag.toLowerCase()).join(' ');
    });
    // Uncheck the corresponding checkbox
    const checkbox = document.querySelector(`input[type="checkbox"][data-tag-id="${tag}"]`);
    if (checkbox) {
      checkbox.checked = false;
    }
  };

  const handleDropdownClick = (category) => {
    if (activeDropdown === category) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(category);
    }
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const handleSeeMore = (category) => {
    setModalCategory(category);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const renderDropdownContent = (category) => {
    const tags = allTags[category] || [];
    const sortedTags = [...tags].sort((a, b) => (a.name || a.teamTitle || a).localeCompare(b.name || b.teamTitle || b));
    const displayTags = sortedTags.slice(0, 5);
    const remainingCount = sortedTags.length - 5;

    return (
      <div className="dropdown-content">
        {displayTags.length > 0 ? (displayTags.map((tag) => (
          <label key={tag._id || tag.id || tag} className="checkbox-labels">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag._id || tag.id || tag)}
              onChange={() => toggleTag(tag._id || tag.id || tag)}
              data-tag-id={tag._id || tag.id || tag}
              data-category={category}
            />
            <span>{tag.name || tag.teamTitle || tag}</span>
          </label>
        ))
        ) : (
          <div className="nooptionsMessage">No projects</div>
        )}
        {remainingCount > 0 && (
          <button onClick={() => handleSeeMore(category)} className="see-more-btn">
            See more ({remainingCount})
          </button>
        )}
      </div>
    );
  };

  const renderClientDropdown = () => { //client dropdown
    const clientTags = allTags.client || [];
    const filteredClients = clientTags.filter(client => {
      const clientNameWords = (client.name || '').toLowerCase().split(' ');
      return clientNameWords.some(word =>
        word.startsWith(clientSearch.toLowerCase())
      );
    });
    const displayClients = filteredClients.slice(0, 5);
    const remainingCount = filteredClients.length - 5;
    return (
      <div className="dropdown-content">
        <input
          type="text"
          placeholder="Search clients..."
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          className="client-search"
        />
        {displayClients.length > 0 ? (displayClients.map((client) => (
          <label key={client._id || client.id} className="checkbox-labels" data-tag-id={client._id || client.id}>
            <input
              type="checkbox"
              checked={selectedTags.includes(client._id || client.id)}
              onChange={() => toggleTag(client._id || client.id)}
              data-tag-id={client._id || client.id}
              data-category="client"
            />
            <span>{client.name}</span>
          </label>
        ))
        ) : (
          <div className="nooptionsMessage">No projects</div>
        )}
        {remainingCount > 0 && (
          <button onClick={() => handleSeeMore('client')} className="see-more-btn">
            See more ({remainingCount})
          </button>
        )}
      </div>
    );
  };


  const Modal = ({ category, onClose, categoryName }) => { //dropdown for see more
    const [search, setSearch] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const tags = allTags[category] || [];

    const groupedTags = useMemo(() => {
      return tags.reduce((acc, tag) => {
        const name = tag.name || tag.teamTitle || tag;
        const firstLetter = name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(tag);
        return acc;
      }, {});
    }, [tags]);

    const availableLetters = useMemo(() => {
      return new Set(Object.keys(groupedTags));
    }, [groupedTags]);

    const filteredGroupedTags = useMemo(() => {
      const filtered = {};
      Object.entries(groupedTags).forEach(([letter, tags]) => {
        const filteredTags = tags.filter(tag => {
          const name = (tag && (tag.name || tag.teamTitle || tag)).toLowerCase();
          return name && name.includes(search.toLowerCase()) &&
            (!selectedLetter || letter === selectedLetter);
        });
        if (filteredTags.length > 0) {
          filtered[letter] = filteredTags.sort((a, b) => {
            // const aSelected = selectedTags.includes(a && (a._id || a.id || a));
            // const bSelected = selectedTags.includes(b && (b._id || b.id || b));

            // Ensure `selectedTags` is correctly referenced without causing unnecessary re-renders
            const aSelected = selectedTags?.includes(a && (a._id || a.id || a));
            const bSelected = selectedTags?.includes(b && (b._id || b.id || b));

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return ((a && (a.name || a.teamTitle || a)) || '').localeCompare((b && (b.name || b.teamTitle || b)) || '');
          });
        }
      });
      return filtered;
    }, [groupedTags, search, selectedLetter]);

    const handleSearch = (e) => {
      setSearch(e.target.value);
      setSelectedLetter('');
    };

    const handleLetterClick = (letter) => {
      if (availableLetters.has(letter)) {
        setSelectedLetter(letter === selectedLetter ? '' : letter);
        setSearch('');
      }
    };

    return (
      <div className="modalOverlay-see-more ">
        <div className="modal2" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="modal-contents">
            <div className="modal-header">
              <h2>{categoryName} Categories</h2>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="search-sections">
              <input
                type="text"
                className="modal-search"
                placeholder="Search.."
                value={search}
                onChange={handleSearch}
              />

              <div className="alphabet-filter">
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                  <button
                    key={letter}
                    className={`
                    ${availableLetters.has(letter) ? 'active' : 'inactive'}
                    ${selectedLetter === letter ? 'font-bold' : ''}
                  `}
                    onClick={() => handleLetterClick(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-contens">
              <div className="category-sections">
                {Object.entries(filteredGroupedTags)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, tags]) => (
                    <div key={letter} className="category-section">
                      <div className="category-letter">{letter}</div>
                      <div className="category-items">
                        {tags.map(tag => {
                          const tagId = tag._id || tag.id || tag;
                          const tagName = tag.name || tag.teamTitle || tag;
                          const count = fetchedProjects.filter(project => {
                            const projectTags = project[category === 'techStack' ? 'techStack' :
                              category === 'features' ? 'feature' :
                                category === 'teams' ? 'team_id' : 'client_id'];
                            if (Array.isArray(projectTags)) {
                              return projectTags.some(t => (t._id || t.id || t) === tagId);
                            }
                            return (projectTags?._id || projectTags?.id || projectTags) === tagId;
                          }).length;

                          return (
                            <label key={tagId} className="category-item" data-tag-id={tagId}>
                              <input
                                type="checkbox"
                                checked={selectedTags.includes(tagId)}
                                onChange={() => toggleTag(tagId)}
                                data-tag-id={tagId}
                                data-category={category}
                              />
                              {tagName}
                              <span className="item-count">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div></div>
    );
  };

  useEffect(() => {
  }, [selectedTags]);

  return (
    <div className="container">
      <div className="panel">
        <div className="title">
          <h1 className="text-white">Projects</h1>
        </div>

        <div className="filterbar">
          <div className="filter-group">
            <div className="dropdown">
              <button onClick={() => handleDropdownClick('sort')} className="dropdown-btn">
                Sort By
                <FaChevronDown
                  className={`dropdown-icon ${activeDropdown === 'sort' ? 'rotate-up' : ''}`}
                />
              </button>
              {activeDropdown === 'sort' && (
                <div className="dropdown-content">
                  <button onClick={() => setSortBy('default')} className={sortBy === 'default' ? 'active' : ''}>Default</button>
                  <button onClick={() => setSortBy('recent')} className={sortBy === 'recent' ? 'active' : ''}>Most Recent</button>
                </div>
              )}
            </div>
            {['techStack', 'features', 'teams', 'client'].map((category) => (
              <div key={category} className="dropdown">
                <button onClick={() => handleDropdownClick(category)} className="dropdown-btn">
                  {category === 'techStack' ? 'TechStack' :
                    category === 'teams' ? 'Teams' :
                      category.charAt(0).toUpperCase() + category.slice(1)}
                  <FaChevronDown
                    className={`dropdown-icon ${activeDropdown === category ? 'rotate-up' : ''}`}
                  />
                </button>
                {activeDropdown === category && (
                  category === 'client' ? renderClientDropdown() : renderDropdownContent(category)
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='filtershow'>
        {(selectedTags.length > 0 || search) && (
          <div className="selected-tags"><h6 className="text-white">Filters : </h6>
            {selectedTags.map(tag => {
              const tagObj = Object.values(allTags).flat().find(t => t._id === tag || t.id === tag || t === tag);
              const tagName = tagObj ? (tagObj.name || tagObj.teamTitle || tagObj) : tag;
              return (
                <span key={tag} className="tag">
                  {tagName}
                  <button onClick={() => removeTag(tag)} className="remove-tag">×</button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && (
        <Projects
          viewType={isListView ? 'list' : 'card'}
          filter={search}
          tags={selectedTags}
          projects={currentProjects}
        />
      )}

      <div className="pagination1">
        <button-container
          className="custom-button"
          onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
          disabled={activePage === 1}
        >
          Previous
        </button-container>
        <span>{activePage} of {totalPages}</span>
        <button-container
          className="custom-button"
          onClick={() => setActivePage(prev => Math.min(prev + 1, totalPages))}
          disabled={activePage === totalPages}
        >
          Next
        </button-container>
      </div>

      {showModal && (
        <Modal
          category={modalCategory}
          categoryName={modalCategory.charAt(0).toUpperCase() + modalCategory.slice(1)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ContentPage;

