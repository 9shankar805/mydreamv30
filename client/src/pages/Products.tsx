import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DistanceBasedProductSearch from "@/components/DistanceBasedProductSearch";
import { useAppMode } from "@/hooks/useAppMode";

export default function Products() {
  const [location] = useLocation();
  const { mode } = useAppMode();
  
  // Get search params directly from window.location.search instead of wouter location
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category');

  useEffect(() => {
    // Update search params when URL changes
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    console.log("Products page location changed:", { 
      location, 
      searchQuery: params.get('search'), 
      categoryQuery: params.get('category'),
      fullURL: window.location.href,
      windowSearch: window.location.search,
      hasSearchParam: window.location.search.includes('search=')
    });
  }, [location]);

  // Force refresh search params when window location changes
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
      console.log("Window location changed (forced refresh):", {
        search: params.get('search'),
        windowSearch: window.location.search
      });
    };

    // Listen for both popstate and custom location changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Also check periodically for location changes (fallback)
    const interval = setInterval(() => {
      const currentSearch = window.location.search;
      const currentSearchQuery = new URLSearchParams(currentSearch).get('search') || '';
      if (currentSearchQuery !== searchQuery) {
        console.log("Location change detected via polling");
        handleLocationChange();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [searchQuery]);

  console.log("Products page rendering with:", { searchQuery, categoryQuery });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Use the new distance-based product search component */}
        <DistanceBasedProductSearch 
          searchQuery={searchQuery}
          category={categoryQuery || ""}
          isRestaurantMode={mode === 'food'}
        />
      </div>
    </div>
  );
}