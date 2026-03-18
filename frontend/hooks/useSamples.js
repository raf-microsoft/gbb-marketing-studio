import { useState, useEffect, useCallback } from "react";

export default function useSamples() {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch("/api/samples")
            .then((res) => res.json())
            .then((data) => setSamples(data.samples || []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [version]);

    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    return { samples, loading, error, refresh };
}
