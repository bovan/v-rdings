import { useEffect, useRef, useState } from "react";
import {
  fetchAirTemperatures,
  type AirTemperature,
  type Stasjon,
} from "src/db/frost";
import { mqttPublishState } from "src/mqtt/mqtt-client";

export default function useTemperaturer(stasjoner: Stasjon[]) {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [airTemperatures, setAirTemperatures] = useState<AirTemperature[]>([]);

  useEffect(() => {
    return () => {
      // on unmount, abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const updateAirTemperatures = () => {
    setIsLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    const ids = stasjoner.map((source) => source.id);
    const signal = abortControllerRef.current.signal;
    fetchAirTemperatures(ids, { signal })
      .then((newTemps) => {
        setAirTemperatures(newTemps);
        mqttPublishState(newTemps);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching temperatures:", error);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return {
    airTemperatures,
    updateAirTemperatures,
    isLoading,
  };
}
