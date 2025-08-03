import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import typeWriter from './script.js';
import './style.css';
import { searchByAllFields } from "../../api/projectApi.js";
import debounce from 'lodash.debounce';

const HeroBanner = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // const debouncedSetSearchTerm = useCallback(
  //   debounce((value) => setDebouncedSearchTerm(value), 300),
  //   []
  // );

  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setDebouncedSearchTerm(value), 300),
    []
  );
  

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  useEffect(() => {
    const cleanup = typeWriter();
    return () => cleanup();
  }, []);

  useEffect(() => {
    let isMounted = true;
    setError(null);

    const searchProjects = async () => {
      setIsLoading(true);
      try {
        const results = await searchByAllFields(debouncedSearchTerm);
        if (isMounted) {
          setSearchResults(results.data || []);
          setShowDropdown(results.data && results.data.length > 0);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
          console.error('Search error:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (debouncedSearchTerm) {
      searchProjects();
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm]);

  const { workspacename: paramWorkspace } = useParams(); // Get workspace name from URL  
      const [selectedWorkspace, setSelectedWorkspace] = useState(
        localStorage.getItem("selectedWorkspace") || paramWorkspace || ""
      );
    
      useEffect(() => {
        if (paramWorkspace) {
          setSelectedWorkspace(paramWorkspace);
          localStorage.setItem("selectedWorkspace", paramWorkspace);
        }
      }, [paramWorkspace]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
      setShowDropdown(false);
    }
  };

  const filteredResults = useMemo(() => {
    const clientSet = new Set();
    const techStackSet = new Set();
    const featureSet = new Set();
    const results = {
      projects: [],
      clients: [],
      teams: [],
      techstacks: [],
      features: [],
    };

    const lowerSearchTerm = searchTerm.toLowerCase();

    searchResults.forEach(item => {
      if (item.name && item.name.toLowerCase().includes(lowerSearchTerm)) {
        results.projects.push({ id: item._id, name: item.name, type: 'project' });
      }

      if (item.client_id && item.client_id.name && item.client_id.name.toLowerCase().includes(lowerSearchTerm)) {
        if (!clientSet.has(item.client_id._id)) {
          results.clients.push({ id: item.client_id._id, name: item.client_id.name, type: 'client' });
          clientSet.add(item.client_id._id);
        }
      }

      if (item.team_id && item.team_id.teamTitle && item.team_id.teamTitle.toLowerCase().includes(lowerSearchTerm)) {
        results.teams.push({ id: item.team_id._id, name: item.team_id.teamTitle, type: 'team' });
      }

      if (item.techStack && Array.isArray(item.techStack)) {
        item.techStack.forEach(tech => {
          if (typeof tech === 'object' && tech.name && tech.name.toLowerCase().includes(lowerSearchTerm) && !techStackSet.has(tech.name)) {
            results.techstacks.push({ id: tech._id, name: tech.name, type: 'techstack' });
            techStackSet.add(tech.name);
          }
        });
      }

      if (item.feature && Array.isArray(item.feature)) {
        item.feature.forEach(feature => {
          if (typeof feature === 'object' && feature.name && feature.name.toLowerCase().includes(lowerSearchTerm) && !featureSet.has(feature.name)) {
            results.features.push({ id: feature._id, name: feature.name, type: 'feature' });
            featureSet.add(feature.name);
          }
        });
      }
    });

    return results;
  }, [searchResults, searchTerm]);

  const uniqueResults = useMemo(() => {
    const allResults = [
      ...filteredResults.projects,
      ...filteredResults.clients,
      ...filteredResults.teams,
      ...filteredResults.techstacks,
      ...filteredResults.features,
    ];

    return Array.from(
      new Map(allResults.map(item => [`${item.type}-${item.id}`, item])).values()
    );
  }, [filteredResults]);

  const hasResults = uniqueResults.length > 0;

  const handleItemClick = (item) => {
    setSearchTerm(item.name);
    debouncedSetSearchTerm(item.name);

    switch (item.type) {
      case 'project':
        navigate(`/${selectedWorkspace}/platform-management-feature/projectdetails/${item.id}`);
      //navigate(`/platform-management-feature/projectdetails/${item.id}`);
        setShowDropdown(false);
        break;
      case 'client':
        navigate(`/${selectedWorkspace}/platform-management-feature/Client/${item.id}`);
        //navigate(`/platform-management-feature/Client/${item.id}`);
        setShowDropdown(false);
        break;
      case 'team':
        navigate(`/${selectedWorkspace}/platform-management-feature/Pod/${item.id}`)
        //navigate(`/platform-management-feature/Pod/${item.id}`);
        setShowDropdown(false);
        break;
      case 'techstack':
      case 'feature':
        // Update search term and keep the dropdown open
        setShowDropdown(true);
        break;
      default:
        console.error('Unknown item type:', item.type);
        setShowDropdown(false);
    }

    onSearch(item.name);
  };

  return (
    <div className="hero-container">
      <div className="content-wrapper">
        <div className="oval-background"></div>
        <div className="typing-container">
          <p id="typing" aria-live="polite"></p>
          <span className="cursor"></span>
        </div>

        <div className="search-bars" style={{ position: 'relative', zIndex: 100 }}>
          <input 
            type="text" 
            className="search"
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            style={{ 
              borderRadius: "8px", 
              height: "46px", 
              fontSize: "1.5rem", 
              paddingInline: "30px", 
              background: "transparent", 
              border: "1px #86858b solid", 
              color: "white" 
            }}
          />
          {(showDropdown || searchTerm) && hasResults && (
            <div className="dropdownn" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '0 0 8px 8px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {uniqueResults.map((item) => (
                  <li 
                    key={`${item.type}-${item.id}`} 
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      color: 'black',
                      display: 'flex', 
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ flexGrow: 1 }}>{item.name}</span>
                      <span style={{
                        color: '#999',
                        fontSize: '0.8em',
                      }}>
                        {item.type}
                      </span>
                    </div>
                    {(item.type === 'techstack' || item.type === 'feature') && (
                      <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                        {searchResults.filter(project => 
                          item.type === 'techstack' 
                            ? project.techStack && project.techStack.some(tech => tech.name === item.name)
                            : project.feature && project.feature.some(f => f.name === item.name)
                        ).map(project => (
                          <div key={project._id} style={{ marginLeft: '10px' }}>
                            • {project.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

