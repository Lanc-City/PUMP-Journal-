
import { routineStore } from "@/data/routine-store";
import { useEffect, useState } from "react";

export function useIsAppReady() {
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await routineStore.initialize();
            } catch (e) {
                console.warn(e);
            } finally {
                setIsAppReady(true);
            }
        }

        prepare();
    }, []);

    return { isAppReady };
}
