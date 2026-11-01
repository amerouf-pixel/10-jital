"use client";

import { useState } from "react";

type MapsScraperState =
  | "idle"
  | "searching"
  | "results"
  | "error";

export type MapsScraperResult = {
  name: string;
  rating: number;
  address: string;
  phone: string;
  website: string;
};

export type MapsScraperSearchParams = {
  query: string;
  location: string;
  maxResults: number;
};

export function useMapsScraper() {
  const [state, setState] = useState<MapsScraperState>("idle");
  const [results, setResults] = useState<MapsScraperResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: MapsScraperSearchParams) => {
    setState("searching");
    setResults([]);
    setError(null);

    try {
      const response = await fetch("/api/maps-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setState("error");
      } else {
        setResults(data.results);
        setState("results");
      }
    } catch (err) {
      setError("Network error");
      setState("error");
    }
  };

  return {
    state,
    results,
    error,
    search,
  };
}