// src/components/MediaWikiSearch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MediaWikiSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [resultCount, setResultCount] = useState(0);

  const searchMediaWiki = async () => {
    try {
      const response = await axios.get(`https://web.bdij.com.br/w/api.php?action=query&format=json&list=search&srsearch=${query}&origin=*`);
      const searchResults = response.data.query.search;
      
      // Para cada resultado, fazer uma chamada individual para obter mais informações
      const detailedResults = await Promise.all(searchResults.map(async result => {
        const detailedResponse = await axios.get(`https://bdij-proxy.onrender.com/proxy?resource=${result.title}`);
        return {
          id: result.id,
          title: result.title,
          source: detailedResponse.data.source,
        };
      }));

      setResults(detailedResults);
      setResultCount(detailedResults.length);
      setNoResultsMessage(resultCount === 0 ? 'Nenhum resultado encontrado.' : '');
    } catch (error) {
      console.error('Error searching MediaWiki:', error);
    }
  };

  useEffect(() => {
    searchMediaWiki();
  }, [query]);

  const highlightQuery = (text, query) => {
    // Função para destacar a palavra de busca
    const regex = new RegExp(`(${query})`, 'gi');
    const highlightedText = text.replace(regex, (match, p1) => `<mark>${p1}</mark>`);
    return { __html: highlightedText };
  };

  return (
    <div>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={searchMediaWiki}>Search</button>
      <p>{resultCount} resultados encontrados.</p>
      <ul>
        {results.map(result => (
          <li key={result.id}>
            <strong>Title:</strong> <span dangerouslySetInnerHTML={highlightQuery(result.title, query)} /> <br />
            <strong>Source:</strong> <span dangerouslySetInnerHTML={highlightQuery(result.source, query)} />
          </li>
        ))}
      </ul>
      <p>{noResultsMessage}</p>
    </div>
  );
};

export default MediaWikiSearch;