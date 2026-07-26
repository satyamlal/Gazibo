"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClientJobRedirect() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        router.replace(`/jobs/${params.id as string}`);
    }, [params.id, router]);

    return null;
}